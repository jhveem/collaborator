COLLABORATOR_SETTINGS_FUNCTIONS = {
  APP: {},
  _init(app) {
    this.APP = app;
    this.loadSettingsAll();
  },
  async loadSettingsAll() { 
    let APP = this.APP;
    let settingsGeneralData = await APP.API.loadSettingsGeneral(APP.userId);
    if (settingsGeneralData !== undefined) {
      let settingsGeneral = settingsGeneralData.data; 
      if (settingsGeneral.showMenu !== undefined) {
        let showMenu = (settingsGeneral.showMenu === "true");
        APP.toggleWindow(showMenu);
      }
      if (settingsGeneral.userSettings !== undefined) {
        APP.userSettings = settingsGeneral.userSettings;
        for (var setting in APP.userSettings) {
          let value = APP.userSettings[setting];
          if (value === "true") {
            APP.userSettings[setting] = true;
          } 
          if (value === "false") {
            APP.userSettings[setting] = false;
          } 
        }
      }
    }

    let settingsCourseData = await APP.API.loadSettingsCourse(APP.userId, APP.courseId);
    if (settingsCourseData !== undefined && settingsCourseData !== null) {
      let settingsCourse = settingsCourseData.data; 
      if (settingsCourse.openTabs !== undefined && settingsCourse.openTabs !== '') {
        APP.openTabs = settingsCourse.openTabs;
      }
    }
  }
}