<template>
  <div id="vue-app">
    <div>
    <i class="icon-settings" style="float: right; margin-right: 20px; padding-top: 10px; cursor: pointer;" @click="openModal('settings');"></i>
    <h3 class="collaborator-menu-header">{{header}}</h3>
    </div>
    <div v-if="menuCurrent ==='projects'">
      <div class="canvas-collaborator-menu-item canvas-collaborator-menu-item-new" @click="openModal('new-project')">
        <i class="icon-add"></i>
        New Project
      </div>
      <div v-for="(todo, t) in todos" :key="t">
        <todo-item
          :todo="todo"
          :settings="settings"
          :open-tabs="openTabs"
          @toggle="toggle($event);"
          @new-todo="openModal('new-todo', project); modalTodoProject = project;"
          @edit-todo="openModal('edit-todo', $event); modalTodoProject = project;"
          @delete-todo="deleteTodo($event);"
          @resolve-todo="resolveTodo($event);"
          @unresolve-todo="unresolveTodo($event);"
          @new-comment="openModal('new-comment', $event); newCommentTodo=$event._id;"
          @delete-comment="deleteComment($event['todo'], $event['comment']);"
        >
        </todo-item>
      </div>
    </div>
    <div v-show="modal!==''">
      <div class='canvas-collaborator-modal-background' @click.self="closeModal()">
        <div id='canvas-collaborator-modal' class='canvas-collaborator-modal'>
          <i style="float: right; cursor: pointer;" class="icon-end" @click="closeModal()"></i>
          <div v-if="checkModal('new-project')">
            <h2>Create Project</h2>
            <label>Name</label>
            <input type="text" v-model="newProjectName"/>
            <div class="canvas-collaborator-button" @click="createProject(); closeModal();">Save</div>
          </div>
          <div v-if="checkModal('edit-project')">
            <edit-project
              :project="modalObject"
            >
            </edit-project>
          </div>
          <div v-if="checkModal('new-todo')">
            <new-todo
              :current-page-type="pageType"
              :page-types="pageTypes"
              :page-id="pageId"
              :user-names="userNames"
              :project="modalTodoProject"
              :project-members="projectMembers"
              :project-tags="modalTodoProject.tags"
              @create-todo="createTodo($event); closeModal();"
            >
            </new-todo>
          </div> 
          <div v-if="checkModal('edit-todo')">
            <edit-todo 
              :current-page-type="pageType"
              :todo="modalObject"
              :page-types="pageTypes"
              :page-id="pageId"
              :user-names="userNames"
              :project="modalTodoProject"
              :project-members="projectMembers"
              :project-tags="modalTodoProject.tags"
            >
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