<template>
	<div class="tabs">
		<button 
			class="tab-button" 
			:class="{ active: activeTab === 'links' }"
			@click="activeTab = 'links'"
		>
			Links
		</button>
		<button 
			class="tab-button" 
			:class="{ active: activeTab === 'calendar' }"
			@click="activeTab = 'calendar'"
		>
			Calendar
		</button>
	</div>

	<div v-if="activeTab === 'links'" class="container links">
		<LinkConsole></LinkConsole>
	</div>
	<div v-if="activeTab === 'calendar'" class="container calendar">
		<Calendar></Calendar>
	</div>
</template>

<script setup>
import Calendar from './components/Calendar.vue'
import LinkConsole from './components/LinkConsole.vue'
</script>

<script>
export default {
	data() {
		return {
			v: '0.1',
			activeTab: 'links'
		}
	},
	components: {
		Calendar, LinkConsole
	}
}
</script>