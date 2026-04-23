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
			tag="transition-group"
			:component-data="{
				tag: 'div',
				type: 'transition-group',
				name: !drag ? 'flip-list' : null
			}"
			v-model="group.items"
			v-bind="dragOptions"
			@start="drag = true"
			@end="drag = false"
			item-key="id"
		>
			<template #item="{ element }">
				<button 
					:class="element.fixed ? 'fa fa-anchor' : 'glyphicon glyphicon-pushpin'"
					@click="element.fixed = !element.fixed"
					v-on:click.native="openItem(element)"
					aria-hidden="true"
				>
					{{ element.name }}
				</button>
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
		openItem(item) {
			if (item.type === "folder" || item.type === "file") {
				window.api.openFolder(item.path);
			} else if (item.type === "url") {
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
				ghostClass: "ghost"
			};
		}
	}
}
</script>