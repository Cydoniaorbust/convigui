<template>
	<!-- Month View -->
	<template v-if="!isYearView">
		<div class="calendar-header">
			<button @click="prevMonth">&#8592;</button>
			<span>{{ monthNames[currentMonth] }} {{ currentYear }}</span>
			<button @click="nextMonth">&#8594;</button>
			<button class="view-toggle-btn" @click="toggleYearView">Year</button>
		</div>
		<div class="calendar-grid">
			<div class="calendar-weekdays">
					<div v-for="wday in weekDays" :key="wday">{{ wday }}</div>
			</div>
			<div class="calendar-days">
					<div
						v-for="(day, idx) in calendarDays"
						:key="idx"
						:class="{
							'not-current-month': !day.currentMonth,
							'today': day.isToday,
							'selected': day.isSelected,
							'has-note': hasNote(day.date)
						}"
						:style="{ backgroundColor: getNoteColor(day.date) }"
						@click="handleDayClick(day)"
					>
						{{ day.date.getDate() }}
					</div>
			</div>
		</div>
	</template>

	<!-- Year View -->
	<template v-else>
		<div class="calendar-header">
			<button @click="prevYear">&#8592;</button>
			<span>{{ currentYear }}</span>
			<button @click="nextYear">&#8594;</button>
			<button class="view-toggle-btn" @click="toggleYearView">Month</button>
		</div>
		<div class="year-grid">
			<div 
				v-for="monthIdx in 12" 
				:key="monthIdx"
				class="year-month-mini"
			>
				<div class="mini-month-header">{{ monthNames[monthIdx - 1] }}</div>
				<div class="mini-weekdays">
					<div v-for="wday in weekDays" :key="wday" class="mini-wday">{{ wday.charAt(0) }}</div>
				</div>
				<div class="mini-days">
					<div
						v-for="(day, idx) in generateYearMonthCalendar(monthIdx - 1)"
						:key="idx"
						:class="{
							'not-current-month': !day.currentMonth,
							'today': day.isToday,
							'selected': day.isSelected,
							'mini-day': true,
							'has-note': hasNote(day.date)
						}"
						:style="{ backgroundColor: getNoteColor(day.date) }"
						@click="handleDayClick(day)"
					>
						{{ day.date.getDate() }}
					</div>
				</div>
			</div>
		</div>
	</template>

	<Teleport to="body">
	<!-- Note Dialog -->
	<div v-if="showNoteDialog" class="modal-overlay" @click.self="closeNoteDialog">
		<div class="modal-content">
			<div class="modal-header">
				<h2>{{ isEditingExistingNote ? 'Edit Note' : 'Add Note' }}</h2>
				<button class="close-btn" @click="closeNoteDialog">✕</button>
			</div>
			<div class="modal-body">
				<div class="form-group">
					<label>Note Text:</label>
					<textarea 
						ref="noteTextarea"
						autofocus
						v-model="noteText" 
						placeholder="Enter your note..."
						class="note-textarea"
					></textarea>
				</div>
				<div class="form-group">
					<label>Color:</label>
					<div class="color-picker">
						<div 
							v-for="color in colorOptions" 
							:key="color"
							class="color-option"
							:style="{ backgroundColor: color }"
							:class="{ selected: noteColor === color }"
							@click="noteColor = color"
						></div>
					</div>
				</div>
			</div>
			<div class="modal-footer">
				<button class="btn-cancel" @click="closeNoteDialog">Cancel</button>
				<button v-if="isEditingExistingNote" class="btn-delete" @click="deleteCurrentNote">Delete</button>
				<button class="btn-save" @click="saveNote">Save</button>
			</div>
		</div>
	</div>
	</Teleport>
</template>

<script>
export default {
	name: 'Calendar',
	watch: {
		showNoteDialog(isOpen, wasOpen) {
			if (isOpen && !wasOpen) {
				this.focusNoteTextarea()
			}
		}
	},
	data() {
		const today = new Date()
		return {
			currentMonth: today.getMonth(),
			currentYear: today.getFullYear(),
			selectedDate: null,
			today: today,
			isYearView: false,
			weekDays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
			monthNames: [
				'Январь', 'Февраль',
				'Март', 'Апрель', 'Май',
				'Июнь', 'Июль', 'Август',
				'Сентябрь', 'Октябрь', 'Ноябрь',
				'Декабрь'
			],
			// Note dialog state
			showNoteDialog: false,
			editingNoteDate: null,
			isEditingExistingNote: false,
			noteText: '',
			noteColor: '#FFD93D',
			colorOptions: [
				'#FFD93D', // Gold
				'#FF6B6B', // Red
				'#4ECDC4', // Teal
				'#95E1D3', // Mint
				'#F38181', // Pink
				'#AA96DA', // Purple
				'#FCBAD3', // Light Pink
				'#A8E6CF'  // Green
			],
			notes: {} // { 'YYYY-MM-DD': { text: '', color: '' } }
		}
	},
	computed: {
		calendarDays() {
			return this.generateCalendar()
		}
	},
	methods: {
		async loadNotes() {
			if (window.api?.getNotes) {
				this.notes = await window.api.getNotes()
				return
			}

			this.loadNotesFromLocalStorage()
		},
		loadNotesFromLocalStorage() {
			const stored = localStorage.getItem('calendarNotes')
			if (stored) {
				this.notes = JSON.parse(stored)
			}
		},
		async saveNotes() {
			console.time('save')
			if (window.api?.setNote && this.editingNoteDate) {
				const key = this.getDateKey(this.editingNoteDate)
				await window.api.setNote(key, {
					text: this.noteText,
					color: this.noteColor
				})
			} else {
				localStorage.setItem('calendarNotes', JSON.stringify(this.notes))
			}
			console.timeEnd('save')
		},
		getDateKey(date) {
			const year = date.getFullYear()
			const month = String(date.getMonth() + 1).padStart(2, '0')
			const day = String(date.getDate()).padStart(2, '0')
			return `${year}-${month}-${day}`
		},
		hasNote(date) {
			const key = this.getDateKey(date)
			return key in this.notes
		},
		getNoteColor(date) {
			const key = this.getDateKey(date)
			return this.notes[key]?.color || null
		},
		getNote(date) {
			const key = this.getDateKey(date)
			return this.notes[key] || null
		},
		async focusNoteTextarea() {
			if (window.api?.focusWindow) {
				await window.api.focusWindow()
			}

			const focusTextarea = () => {
				const textarea = this.$refs.noteTextarea
				if (!textarea) return
				window.focus()
				textarea.focus({ preventScroll: true })
				const cursorPosition = textarea.value.length
				textarea.setSelectionRange(cursorPosition, cursorPosition)
			}

			this.$nextTick(() => {
				requestAnimationFrame(() => {
					focusTextarea()
					setTimeout(focusTextarea, 0)
					setTimeout(focusTextarea, 50)
				})
			})
		},
		openNoteDialog(date, note = null) {
			this.editingNoteDate = date
			this.isEditingExistingNote = Boolean(note)
			this.noteText = note?.text || ''
			this.noteColor = note?.color || '#FFD93D'
			this.showNoteDialog = true
		},
		handleDayClick(day) {
			if (!day.currentMonth) {
				const date = day.date
				this.currentMonth = date.getMonth()
				this.currentYear = date.getFullYear()
				return
			}

			const date = day.date
			const existingNote = this.getNote(date)

			if (existingNote) {
				this.openNoteDialog(date, existingNote)
			} else {
				this.openNoteDialog(date)
			}

			this.selectedDate = date
		},
		saveNote() {
			if (!this.editingNoteDate) return
			if (!this.noteText.trim()) {
				alert('Please enter some text for the note')
				return
			}

			const key = this.getDateKey(this.editingNoteDate)
			this.notes[key] = {
				text: this.noteText,
				color: this.noteColor
			}
			this.saveNotes()
			this.closeNoteDialog()
			// this.$forceUpdate() // Force update to reflect color changes
		},
		async deleteCurrentNote() {
			if (!this.editingNoteDate) return
			if (confirm('Delete this note?')) {
				const key = this.getDateKey(this.editingNoteDate)
				delete this.notes[key]
				if (window.api?.deleteNote) {
					await window.api.deleteNote(key)
				} else {
					localStorage.setItem('calendarNotes', JSON.stringify(this.notes))
				}
				this.closeNoteDialog()
				// this.$forceUpdate()
			}
		},
		closeNoteDialog() {
			this.showNoteDialog = false
			this.editingNoteDate = null
			this.isEditingExistingNote = false
			this.noteText = ''
			this.noteColor = '#FFD93D'
		},
		generateCalendar() {
			// 1. Определяем первый и последний день месяца
			const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1)
			const lastDayOfMonth = new Date(this.currentYear, this.currentMonth + 1, 0)
			// 2. Определяем день недели для первого дня месяца: 0 - воскресенье
			let startDay = firstDayOfMonth.getDay()
			// Для недели, где Пн - первый, превращаем 0 в 6, иначе уменьшаем на 1
			startDay = (startDay + 6) % 7
	
			const days = []
	
			// 3. Добавляем предыдущие дни (от конца прошлого месяца, если нужно)
			for (let i = 0; i < startDay; i++) {
				const date = new Date(
					this.currentYear, 
					this.currentMonth, 
					-(startDay - i - 1)
				)
				days.push({
					date,
					currentMonth: false,
					isToday: this.isToday(date),
					isSelected: this.isSelected(date)
				})
			}
	
			// 4. Текущий месяц
			for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
				const date = new Date(this.currentYear, this.currentMonth, d)
				days.push({
					date,
					currentMonth: true,
					isToday: this.isToday(date),
					isSelected: this.isSelected(date)
				})
			}
	
			// 5. Дополняем до полного количества ячеек (6 строк по 7 дней)
			while (days.length % 7 !== 0) {
				const date = new Date(this.currentYear, this.currentMonth + 1, days.length - lastDayOfMonth.getDate() - startDay + 1)
				days.push({
					date,
					currentMonth: false,
					isToday: this.isToday(date),
					isSelected: this.isSelected(date)
				})
			}
	
			return days
		},
		isToday(date) {
			return (
				date.getDate() === this.today.getDate() &&
				date.getMonth() === this.today.getMonth() &&
				date.getFullYear() === this.today.getFullYear()
			)
		},
		isSelected(date) {
			if (!this.selectedDate) return false
			return (
				date.getDate() === this.selectedDate.getDate() &&
				date.getMonth() === this.selectedDate.getMonth() &&
				date.getFullYear() === this.selectedDate.getFullYear()
			)
		},
		prevMonth() {
			if (this.currentMonth === 0) {
				this.currentMonth = 11
				this.currentYear -= 1
			} else {
				this.currentMonth -= 1
			}
		},
		nextMonth() {
			if (this.currentMonth === 11) {
				this.currentMonth = 0
				this.currentYear += 1
			} else {
				this.currentMonth += 1
			}
		},
		prevYear() {
			this.currentYear -= 1
		},
		nextYear() {
			this.currentYear += 1
		},
		toggleYearView() {
			this.isYearView = !this.isYearView
		},
		generateYearMonthCalendar(monthIdx) {
			// Generate calendar for a specific month in year view
			const firstDayOfMonth = new Date(this.currentYear, monthIdx, 1)
			const lastDayOfMonth = new Date(this.currentYear, monthIdx + 1, 0)
			let startDay = firstDayOfMonth.getDay()
			startDay = (startDay + 6) % 7

			const days = []

			// Previous month days
			for (let i = 0; i < startDay; i++) {
				const date = new Date(this.currentYear, monthIdx, -(startDay - i - 1))
				days.push({
					date,
					currentMonth: false,
					isToday: this.isToday(date),
					isSelected: this.isSelected(date)
				})
			}

			// Current month days
			for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
				const date = new Date(this.currentYear, monthIdx, d)
				days.push({
					date,
					currentMonth: true,
					isToday: this.isToday(date),
					isSelected: this.isSelected(date)
				})
			}

			// Next month days
			while (days.length % 7 !== 0) {
				const date = new Date(this.currentYear, monthIdx + 1, days.length - lastDayOfMonth.getDate() - startDay + 1)
				days.push({
					date,
					currentMonth: false,
					isToday: this.isToday(date),
					isSelected: this.isSelected(date)
				})
			}

			return days
		}
	},
	mounted() {
		this.loadNotes()
	}
}
</script>
