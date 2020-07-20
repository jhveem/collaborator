'use strict';
//look at this for emits with multiple arguments. I hope I haven't broken this... :D
//https://stackoverflow.com/questions/49729384/vue-emit-passing-argument-to-a-function-that-already-have-arguments
Vue.component('todo-item', {
  template: `
  <div>
    <div 
      v-bind:class="{'canvas-collaborator-menu-item-assigned': isAssigned}" 
      class="canvas-collaborator-menu-item canvas-collaborator-menu-item-todo" 
      @click="$emit('edit-todo');"
      :style="{
        'margin-left': (level * 20) + 'px',
        'width': '100% - ' + (level * 20) + 'px'
      }"
     >
      <div class="canvas-collaborator-submenu-delete">
        <i class="icon-trash" @click.stop="$emit('delete-todo', todo);"></i>
        <i class="icon-add" @click.stop="$emit('new-todo', todo);"></i>
      </div>
      <div>
        <i v-if="openTabs.includes(todo._id)" :class="'icon-mini-arrow-down'" @click.stop="$emit('toggle', todo)"></i>
        <i v-else :class="'icon-mini-arrow-right'" @click.stop="$emit('toggle', todo)"></i>
        <i v-if="checkResolvedTodoPage(todo)" class="icon-publish icon-Solid" @click.stop="$emit('unresolve-todo', todo);"></i>
        <i v-else class="icon-publish" @click.stop="$emit('resolve-todo', todo);"></i>
        {{todo.name}}
      </div>
    </div>
    <div v-if="openTabs.includes(todo._id)">
      <div v-for="todoChild in todos">
        <todo-item
          v-if="(todoChild.parentId === todo._id && (todo.pageTypes.includes(pageType) || pageType === '') && (todo.pageId === pageId || todo.pageId === ''))"
          :todo="todoChild"
          :todos="todos"
          :settings="settings"
          :open-tabs="openTabs"
          :level="level + 1"
          @open-tabs="$emit('open-tabs');"
          @toggle="$emit('toggle', $event);"
          @new-todo="$emit('new-todo', $event);"
          @edit-todo="$emit('edit-todo', $event);"
          @delete-todo="$emit('delete-todo', $event);"
          @resolve-todo="$emit('resolve-todo', $event);"
          @unresolve-todo="$emit('unresolve-todo', $event);"
          @new-comment="$emit('new-comment', $event);"
          @delete-comment="$emit('delete-comment', $event);"
        >
        
      </div>
      <div class="canvas-collaborator-menu-item canvas-collaborator-menu-item-new"
        :style="{
          'margin-left': ((level + 1) * 20) + 'px',
          'width': '100% - ' + ((level + 1) * 20) + 'px'
        }" 
        @click="$emit('new-comment', todo);"
      >
        <i class="icon-add"></i>
        New Comment 
      </div>
      <div class="canvas-collaborator-menu-item canvas-collaborator-menu-item-border canvas-collaborator-menu-item-comment" v-for="(comment, x) in todo.loadedComments">
        <comment-item :todo="todo" :comment="comment"
            @delete-comment="$emit('delete-comment', $event);"
          ></comment-item>
      </div>
    </div>
  </div>
  `,
  created: function() {
    if (this.rPagesURL.test(window.location.pathname)) {
      //page specific menu
      let pieces = window.location.pathname.match(this.rPagesURL);
      this.courseId = parseInt(pieces[1]);
      this.pageType = pieces[2];
      this.pageId = pieces[3];
      //await self.getSavedSettings();
    } else if (this.rMainURL.test(window.location.pathname)) {
      //not in a specific page
      let pieces = window.location.pathname.match(this.rMainURL);
      this.courseId = parseInt(pieces[1]);
      //await self.getSavedSettings();
    }
  },
  computed: {
    isAssigned: function() {
      if (this.todo.assignments === null) {
        this.todo.assignments = [''];
      }
      return this.todo.assignments.includes(ENV.current_user_id);
    }
  },
  data: function() {
    return {
      rMainURL: /^\/courses\/([0-9]+)/,
      rPagesURL: /^\/courses\/([0-9]+)\/([a-z]+)\/(.+?)(\/|$|\?)/,
      showMenu: false,
      pageType: '',
      pageId: ''
    }
  },
  props: [
    'todo',
    'todos',
    'project',
    'openTabs',
    'settings',
    'level'
  ],
  methods: {
    checkResolvedTodoPage(todo, pageType, pageId) {
      for (let p = 0; p < todo.pages.length; p++) {
        let page = todo.pages[p];
        if (page.pageType === this.pageType && page.pageId === this.pageId) {
          return true;
        }
      }
      return false;
    }
  }
})

Vue.component('comment-item', {
  template: `
    <div>
        <i class="icon-edit" style="float: right;"></i>
        <i class="icon-trash" style="float: right;" @click="$emit('delete-comment', {'comment': comment, 'todo': todo});"></i>
        <p>{{comment.text}}</p>
        <a :href="'/courses/'+courseId+'/'+comment.pageType+'/'+comment.pageId">Source</a>
        <div style="float: right; font-size: 9px;">
          -{{comment.userName}}<br>{{formatDate(comment.date)}}
        </div>
    </div>
    `,
  data: function() {
    return {
      rMainURL: /^\/courses\/([0-9]+)/,
      rPagesURL: /^\/courses\/([0-9]+)\/([a-z]+)\/(.+?)(\/|$|\?)/,
      showMenu: false,
      courseId: '',
      pageType: '',
      pageId: ''
    }
  },
  props: [
    'todo',
    'comment',
  ],
  created: function() {
    if (this.rPagesURL.test(window.location.pathname)) {
      //page specific menu
      let pieces = window.location.pathname.match(this.rPagesURL);
      this.courseId = parseInt(pieces[1]);
      this.pageType = pieces[2];
      this.pageId = pieces[3];
      //await self.getSavedSettings();
    } else if (this.rMainURL.test(window.location.pathname)) {
      //not in a specific page
      let pieces = window.location.pathname.match(this.rMainURL);
      this.courseId = parseInt(pieces[1]);
      //await self.getSavedSettings();
    }

  },
  methods: {
    formatDate(dateString) {
      let date = new Date(dateString);
      let output = date.getDate() + " " + MONTH_NAMES_SHORT[date.getMonth()] + ", " + date.getFullYear();
      return output;
    },
  }
});

Vue.component('settings', {
  template: `
    <div>
      <input type="checkbox" v-model="settings.showResolved"/><span> Show Resolved</span>
    </div>
  `,
  props: [
    'settings',
  ]
})