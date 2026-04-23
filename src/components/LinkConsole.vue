<template>
	<div
		v-for="group in groups"
		:key="group.type"
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
import links from '../storage/links.js'
import draggable from "vuedraggable";

export default {
	components: { draggable },

	data() {
		return {
			groups: links.groups,
			drag: false
		}
	},

	methods: {
		handleClick(element, type) {
			this.openItem(element, type);
			element.fixed = !element.fixed;
		},

		openItem(item, type) {
			if (["folder", "file"].includes(type)) {
				window.api.openFolder(item.path);
			} else if (type === "url") {
				window.api.openUrl(item.path);
			}
		},

		sort(group) {
			group.items.sort((a, b) => a.id - b.id);
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
	}
}
</script>