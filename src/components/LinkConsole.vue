<template>
	<div
		v-if="!groups.length"
		class="links-empty"
	>
		No shortcuts configured. Edit <code>src/storage/links.js</code> to define launcher groups.
	</div>

	<div
		v-for="(group, groupIndex) in groups"
		:key="`${group.type}-${groupIndex}`"
		:class="group.type"
	>
		<button @click="sort(group)">
			To original order
		</button>

		<draggable
			class="content"
			v-model="group.items"
			v-bind="dragOptions"
			item-key="id"
			@end="saveGroups"
		>
			<template #item="{ element }">
				<div class="item">
					<span class="drag-handle">⋮⋮</span>
					<button 
						@click.stop="handleClick(element, group.type)"
					>
						{{ element.name }}
					</button>
				</div>
			</template>
		</draggable>
	</div>
</template>

<script>
import { cloneLinkGroups } from '../storage/links.js'
import draggable from "vuedraggable";

export default {
	components: { draggable },

	data() {
		return {
			groups: []
		}
	},

	methods: {
		async loadGroups() {
			if (window.api?.getLinks) {
				this.groups = cloneLinkGroups(await window.api.getLinks())
				return
			}

			const stored = localStorage.getItem('linkGroups')
			this.groups = stored ? JSON.parse(stored) : cloneLinkGroups()
		},
		async saveGroups() {
			const groups = cloneLinkGroups(this.groups)

			if (window.api?.setLinks) {
				await window.api.setLinks(groups)
				return
			}

			localStorage.setItem('linkGroups', JSON.stringify(groups))
		},
		handleClick(element, type) {
			this.openItem(element, type);
		},

		openItem(item, type) {
			if (["folder", "file"].includes(type)) {
				window.api.openFolder(item.path);
			} else if (type === "url") {
				window.api.openUrl(item.path);
			}
		},

		async sort(group) {
			group.items.sort((a, b) => a.id - b.id);
			await this.saveGroups()
		}
	},

	computed: {
		dragOptions() {
			return {
				animation: 200,
				ghostClass: "ghost",
				handle: ".drag-handle"
			};
		}
	},
	mounted() {
		this.loadGroups()
	}
}
</script>