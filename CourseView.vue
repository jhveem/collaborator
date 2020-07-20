<template>
  <div id="vue-app">
    <div>
      <i class="icon-settings canvas-collaborator-menu-item-icon" style="margin-right: 20px;" @click="openModal('settings');"></i>
      <i class="icon-add canvas-collaborator-menu-item-icon" @click="openModal('new-todo');"></i>
        <h3 class="collaborator-menu-header">{{header}}</h3>
    </div>
    <div v-if="menuCurrent ==='main'">
      <div v-for="(todo, t) in todos" :key="t">
        <todo-item
          v-if="(todo.parentId === '' && (todo.pageTypes.includes(pageType) || pageType === '') && (todo.pageId === pageId || todo.pageId === ''))"
          :todo="todo" :todos="todos" :settings="userSettings" :open-tabs="openTabs" :level="0" @open-tabs="openTabs"
          @toggle="toggle($event);" @new-todo="openModal('new-todo', $event);"
          @edit-todo="openModal('edit-todo', $event);" @delete-todo="deleteTodo($event);"
          @resolve-todo="resolveTodo($event);" @unresolve-todo="unresolveTodo($event);"
          @new-comment="openModal('new-comment', $event); newCommentTodo=$event._id;"
          @delete-comment="deleteComment($event['todo'], $event['comment']);">
        </todo-item>
      </div>
    </div>
    <div v-show="modal!==''">
      <div class='canvas-collaborator-modal-background' @click.self="closeModal()">
        <div id='canvas-collaborator-modal' class='canvas-collaborator-modal'>
          <i style="float: right; cursor: pointer;" class="icon-end" @click="closeModal()"></i>
          <div v-if="checkModal('new-todo')">
            <new-todo :current-page-type="pageType" :page-types="pageTypes" :page-id="pageId" :user-names="userNames"
              :project-members="projectMembers" @create-todo="createTodo($event); closeModal();">
            </new-todo>
          </div>
          <div v-if="checkModal('edit-todo')">
            <edit-todo :current-page-type="pageType" :todo="modalObject" :page-types="pageTypes" :page-id="pageId"
              :user-names="userNames" :project-members="projectMembers">
            </edit-todo>
          </div>
          <div v-if="checkModal('new-comment')">
            <h2>Comment</h2>
            <textarea type="text" style="height: 200px;" v-model="newCommentText" />
            <div class="canvas-collaborator-button" @click="createComment(modalObject); closeModal();">Comment</div>
          </div> 
          <div v-if="checkModal('settings')">
            <settings
              :settings="userSettings"
            >
            </settings>
          </div>
        </div>
      </div>
    </div> 
  </div>
</template>