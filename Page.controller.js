sap.ui.define([
		'sap/m/Label',
		'sap/m/Popover',
		'sap/ui/core/library',
		'sap/ui/core/format/DateFormat',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/m/MessageToast',
		'sap/base/Log'],
	function(Label, Popover, coreLibrary, DateFormat, Fragment, Controller, JSONModel, MessageToast, Log) {
		"use strict";

		var ValueState = coreLibrary.ValueState;

		return Controller.extend("sap.m.sample.test4.Page", {

			onInit: function () {
				var oModel = new JSONModel();
				oModel.setData({
					startDate: new Date("2022", "9", "31", "10", "0"),
					people: [{
						//pic: "test-resources/sap/ui/documentation/sdk/images/John_Miller.png",
						name: "Алексей Астахов",
						role: "admin",
						appointments: [
							{
								md:"2,5",
								start: new Date("2022", "9", "31", "10", "30"),
								end: new Date("2022", "10", "3", "14", "30"),
								title: "Расширить класс common.tasks",
								type: "Type02",
								tentative: false
							},
							{
								md:"1,4",
								start: new Date("2022", "10", "04", "10", "0"),
								end: new Date("2022", "10", "08", "14", "0"),
								title: "Оптимизировать SQL-запрос",
								info: "DB321",
								type: "Type01",
								pic: "sap-icon://sap-ui5",
								tentative: false
							},
						],
						headers: [
						]
					},
						{
							//pic: "test-resources/sap/ui/documentation/sdk/images/Donna_Moore.jpg",
							name: "Сергей Сорокин",
							role: "team member",
							appointments: [
								{
									md:"0,9",
									start: new Date("2022", "9", "31", "12", "00"),
									end: new Date("2022", "10", "01", "11", "10"),
									title: "Протестировать модуль \"FormatC\"",
									info: "Не на своей машине",
									type: "Type04",
									tentative: false
								},
								{
									md:"2",
									start: new Date("2022", "10", "2", "10", "0"),
									end: new Date("2022", "10", "4", "10", "0"),
									title: "Починить принтер",
									info: "В учебном классе",
									type: "Type07",
									pic: "sap-icon://sap-ui5",
									tentative: false
								},
							],
							headers: [
							]
						},
						{
							//pic: "sap-icon://employee",
							name: "Максим Матвеев",
							role: "team member",
							appointments: [
								{
									md:"0,5",
									start: new Date("2022", "9", "31", "16", "00"),
									end: new Date("2022", "10", "1", "12", "00"),
									title: "Решить вопрос с ФЗ по подписанию",
									type: "Type02",
									tentative: false
								},
							]
						}
					]
				});
				this.getView().setModel(oModel);
				const taskData = {
					"tasks":[
						{"key":0,"name":"Задача 1","md":"1,1","mdt":"ч/д","planned":""},
						{"key":1,"name":"Задача 2","md":"10,8","mdt":"ч/д","planned":""},
						{"key":2,"name":"Задача 3","md":"4","mdt":"ч/д","planned":""},
						{"key":3,"name":"Задача 4","md":"5","mdt":"ч/д","planned":"Запланирована!"},
						{"key":4,"name":"Задача 5","md":"2","mdt":"ч/д","planned":""},
						]
				};
				this.getView().byId("tasks").setModel(new sap.ui.model.json.JSONModel(taskData));
			},

			_aDialogTypes: [
				{ title: "Запланировать задачу", type: "create_appointment" },
				{ title: "Запланировать задачу", type: "create_appointment_with_context"},
				{ title: "Редактировать задачу", type: "edit_appointment" }],

			handleAppointmentSelect: function (oEvent) {
				var oAppointment = oEvent.getParameter("appointment");

				if (oAppointment) {
					this._handleSingleAppointment(oAppointment);
				} else {
					this._handleGroupAppointments(oEvent);
				}
			},

			_addNewAppointment: function(oAppointment){
				var oModel = this.getView().getModel(),
					sPath = "/people/" + this.byId("selectPerson").getSelectedIndex().toString(),
					oPersonAppointments;

				if (this.byId("isIntervalAppointment").getSelected()){
					sPath += "/headers";
				} else {
					sPath += "/appointments";
				}

				oPersonAppointments = oModel.getProperty(sPath);

				oPersonAppointments.push(oAppointment);

				oModel.setProperty(sPath, oPersonAppointments);
			},

			handleCancelButton: function () {
				this.byId("detailsPopover").close();
			},

			handleAppointmentCreate: function (oEvent) {
				this._arrangeDialogFragment(this._aDialogTypes[0].type);
				},

			handleAppointmentAddWithContext: function (oEvent) {
				this.oClickEventParameters = oEvent.getParameters();
				this._arrangeDialogFragment(this._aDialogTypes[1].type);
			},

			_validateDateTimePicker: function (oDateTimePickerStart, oDateTimePickerEnd,oMdValue) {
				var oStartDate = oDateTimePickerStart.getDateValue(),
					oEndDate = oDateTimePickerEnd,
					oMd = oMdValue.getValue(),
					sValueStateText = "Дата начала должна быть раньше даты окончания";
				// if (oStartDate && oEndDate && oEndDate.getTime() <= oStartDate.getTime()) {
				// 	oDateTimePickerStart.setValueState(ValueState.Error);
				// 	oDateTimePickerEnd.setValueState(ValueState.Error);
				// 	oDateTimePickerStart.setValueStateText(sValueStateText);
				// 	oDateTimePickerEnd.setValueStateText(sValueStateText);
				// } else {
					oDateTimePickerStart.setValueState(ValueState.None);
					oDateTimePickerEnd.setValueState(ValueState.None);
//				}
			},

			updateButtonEnabledState: function (oDialog) {
				var oStartDate = this.byId("startDate"),
					oEndDate = this.byId("endDate"),
					bEnabled = oStartDate.getValueState() !== ValueState.Error
					&& oStartDate.getValue() !== ""
					&& oEndDate.getValue() !== ""
					&& oEndDate.getValueState() !== ValueState.Error;

					oDialog.getBeginButton().setEnabled(bEnabled);
			},

			handleCreateChange: function (oEvent) {

				var oDateTimePickerStart = this.byId("startDate"),
					oDateTimePickerEnd = this.byId("endDate"),
					oMd = this.byId("md");
				oDateTimePickerEnd = oDateTimePickerStart+1
console.log(oDateTimePickerEnd)
				if (oEvent.getParameter("valid")) {
					this._validateDateTimePicker(oDateTimePickerStart, oDateTimePickerEnd,oMd);
				} else {
					oEvent.getSource().setValueState(ValueState.Error);
				}

				this.updateButtonEnabledState(this.byId("createDialog"));
			},

			_removeAppointment: function(oAppointment, sPersonId){
				var oModel = this.getView().getModel(),
					sTempPath,
					aPersonAppointments,
					iIndexForRemoval;

				if (!sPersonId){
					sTempPath = this.sPath.slice(0,this.sPath.indexOf("appointments/") + "appointments/".length);
				} else {
					sTempPath = "/people/" + sPersonId + "/appointments";
				}

				aPersonAppointments = oModel.getProperty(sTempPath);
				iIndexForRemoval = aPersonAppointments.indexOf(oAppointment);

				if (iIndexForRemoval !== -1){
					aPersonAppointments.splice(iIndexForRemoval, 1);
				}

				oModel.setProperty(sTempPath, aPersonAppointments);
			},

			handleDeleteAppointment: function(){
				var oDetailsPopover = this.byId("detailsPopover"),
					oBindingContext = oDetailsPopover.getBindingContext(),
					oAppointment = oBindingContext.getObject(),
					iPersonIdStartIndex = oBindingContext.getPath().indexOf("/people/") + "/people/".length,
					iPersonId = oBindingContext.getPath()[iPersonIdStartIndex];

				this._removeAppointment(oAppointment, iPersonId);
				oDetailsPopover.close();
			},

			handleEditButton: function(){
				var oDetailsPopover = this.byId("detailsPopover");
				this.sPath = oDetailsPopover.getBindingContext().getPath();
				oDetailsPopover.close();
				this._arrangeDialogFragment(this._aDialogTypes[2].type);

			},

			_arrangeDialogFragment: function (iDialogType) {
				var oView = this.getView();

				if (!this._pNewAppointmentDialog) {
					this._pNewAppointmentDialog = Fragment.load({
						id: oView.getId(),
						name: "sap.m.sample.test4.Create",
						controller: this
					}).then(function(oDialog) {
						oView.addDependent(oDialog);
						return oDialog;
					});
				}
				this._pNewAppointmentDialog.then(function(oDialog) {
					this._arrangeDialog(iDialogType, oDialog);
				}.bind(this));
			},

			_arrangeDialog: function(sDialogType, oDialog) {
				var sTempTitle = "";
				oDialog._sDialogType = sDialogType;
				if (sDialogType === "edit_appointment"){
					this._setEditAppointmentDialogContent(oDialog);
					sTempTitle = this._aDialogTypes[2].title;
				} else if (sDialogType === "create_appointment_with_context"){
					this._setCreateWithContextAppointmentDialogContent();
					sTempTitle = this._aDialogTypes[1].title;
				} else if (sDialogType === "create_appointment"){
					if (!this._setCreateAppointmentDialogContent())
						return;
					sTempTitle = this._aDialogTypes[0].title;
				} else {
					Log.error("Wrong dialog type.");
				}

				this.updateButtonEnabledState(oDialog);
				oDialog.setTitle(sTempTitle);
				oDialog.open();
			},

			handleAppointmentTypeChange: function(oEvent){
				var oAppointmentType = this.byId("isIntervalAppointment");

				oAppointmentType.setSelected(oEvent.getSource().getSelected());
			},

			handleDialogCancelButton: function(){
				this.byId("createDialog").close();
			},

			_editAppointment: function(oAppointment, bIsIntervalAppointment, iPersonId, oNewAppointmentDialog){
				var sAppointmentPath = this._appointmentOwnerChange(oNewAppointmentDialog),
					oModel = this.getView().getModel();

				if (bIsIntervalAppointment) {
					this._convertToHeader(oAppointment, iPersonId, oNewAppointmentDialog);
				} else {
					if (this.sPath !== sAppointmentPath) {
						this._addNewAppointment(oNewAppointmentDialog.getModel().getProperty(this.sPath));
						this._removeAppointment(oNewAppointmentDialog.getModel().getProperty(this.sPath));
					}
					oModel.setProperty(sAppointmentPath + "/title", oAppointment.title);
					oModel.setProperty(sAppointmentPath + "/info", oAppointment.info);
					oModel.setProperty(sAppointmentPath + "/type", oAppointment.type);
					oModel.setProperty(sAppointmentPath + "/start", oAppointment.start);
					oModel.setProperty(sAppointmentPath + "/end", oAppointment.end);
					oModel.setProperty(sAppointmentPath + "/md", oAppointment.md);
				}
			},

			_convertToHeader: function(oAppointment, oNewAppointmentDialog){
				var sPersonId = this.byId("selectPerson").getSelectedIndex().toString();

				this._removeAppointment(oNewAppointmentDialog.getModel().getProperty(this.sPath), sPersonId);
				this._addNewAppointment({start: oAppointment.start, end: oAppointment.end, title: oAppointment.title, type: oAppointment.type});
			},

			handleDialogSaveButton: function(){
				var oStartDate = this.byId("startDate"),
					oEndDate = this.byId("endDate"),
					sInfoValue = this.byId("moreInfo").getValue(),
					sMdValue = this.byId("md").getValue(),
					sInputTitle = this.byId("inputTitle").getValue(),
					iPersonId = this.byId("selectPerson").getSelectedIndex(),
					oModel = this.getView().getModel(),
					bIsIntervalAppointment = this.byId("isIntervalAppointment").getSelected(),
					oNewAppointmentDialog = this.byId("createDialog"),
					oNewAppointment;

					if (oStartDate.getValueState() !== ValueState.Error
					&& oEndDate.getValueState() !== ValueState.Error){
						if (this.sPath && oNewAppointmentDialog._sDialogType === "edit_appointment") {
							this._editAppointment({
								title: sInputTitle,
								info: sInfoValue,
								md:		sMdValue,
								type: this.byId("detailsPopover").getBindingContext().getObject().type,
								start: oStartDate.getDateValue(),
								end: oEndDate.getDateValue()}, bIsIntervalAppointment, iPersonId, oNewAppointmentDialog);
						} else {
							if (bIsIntervalAppointment) {
								oNewAppointment = {
									title: sInputTitle,
									start: oStartDate.getDateValue(),
									end: oEndDate.getDateValue()
								};
							} else {
								oNewAppointment = {
									title: sInputTitle,
									info: sInfoValue,
									md:	sMdValue,
									start: oStartDate.getDateValue(),
									end: oEndDate.getDateValue()
								};
							}
							this._addNewAppointment(oNewAppointment);
					}

					oModel.updateBindings();

					oNewAppointmentDialog.close();
				}
			},

			_appointmentOwnerChange: function(oNewAppointmentDialog){
				var iSpathPersonId = this.sPath[this.sPath.indexOf("/people/") + "/people/".length],
					iSelectedPerson = this.byId("selectPerson").getSelectedIndex(),
					sTempPath = this.sPath,
					iLastElementIndex = oNewAppointmentDialog.getModel().getProperty("/people/" + iSelectedPerson.toString() + "/appointments/").length.toString();

				if (iSpathPersonId !== iSelectedPerson.toString()){
					sTempPath = "".concat("/people/", iSelectedPerson.toString(), "/appointments/", iLastElementIndex.toString());
				}

				return sTempPath;
			},

			_setCreateAppointmentDialogContent: function(){
				if (this.getView().byId("tasks").getSelectedItemId()===''){
					MessageToast.show("Нужно, все-таки, выбрать задачу из списка!");
					return false;
				}
				const idx =this.getView().byId("tasks").getSelectedKey();
				if (this.getView().byId("tasks").getModel().oData.tasks[idx].planned!==''){
					MessageToast.show("Увы, задача уже запланирована!");
					return false;
				}
				const aTask = this.getView().byId("tasks").getModel().oData.tasks[idx];
				var oAppointmentType = this.byId("isIntervalAppointment"),
					oDateTimePickerStart = this.byId("startDate"),
					oDateTimePickerEnd =  this.byId("endDate"),
					oTitleInput = this.byId("inputTitle"),
					oMoreInfoInput = this.byId("moreInfo"),
					oMdInput = this.byId("md"),
					oPersonSelected = this.byId("selectPerson");

				//Set the person in the first row as selected.
				oPersonSelected.setSelectedItem(this.byId("selectPerson").getItems()[0]);
				oDateTimePickerStart.setValue("");
				oDateTimePickerEnd.setValue("");
				oDateTimePickerStart.setValueState(ValueState.None);
				oDateTimePickerEnd.setValueState(ValueState.None);
				oTitleInput.setValue("");
				oMoreInfoInput.setValue("");
				oMdInput.setValue("");
				oAppointmentType.setSelected(false);

				if (aTask){
					oMdInput.setValue(aTask.md);
					oTitleInput.setValue(aTask.name);
				}
				return true;
			},

			_setCreateWithContextAppointmentDialogContent: function(){
				var aPeople = this.getView().getModel().getProperty('/people/'),
					oSelectedIntervalStart = this.oClickEventParameters.startDate,
					oStartDate = this.byId("startDate"),
					oSelectedIntervalEnd = this.oClickEventParameters.endDate,
					oEndDate = this.byId("endDate"),
					oDateTimePickerStart = this.byId("startDate"),
					oDateTimePickerEnd =  this.byId("endDate"),
					oAppointmentType = this.byId("isIntervalAppointment"),
					oTitleInput = this.byId("inputTitle"),
					oMoreInfoInput = this.byId("moreInfo"),
					oMdInput = this.byId("md"),
					sPersonName,
					oPersonSelected;

				if (this.oClickEventParameters.row){
					sPersonName = this.oClickEventParameters.row.getTitle();
					oPersonSelected = this.byId("selectPerson");

					oPersonSelected.setSelectedIndex(aPeople.indexOf(aPeople.filter(function(oPerson){return  oPerson.name === sPersonName;})[0]));

				}

				oStartDate.setDateValue(oSelectedIntervalStart);

				oEndDate.setDateValue(oSelectedIntervalEnd);

				oTitleInput.setValue("");

				oMoreInfoInput.setValue("");

				oMdInput.setValue("");

				oAppointmentType.setSelected(false);

				oDateTimePickerStart.setValueState(ValueState.None);
				oDateTimePickerEnd.setValueState(ValueState.None);

				delete this.oClickEventParameters;
			},

			_setEditAppointmentDialogContent: function(oDialog){
				var oAppointment = oDialog.getModel().getProperty(this.sPath),
					oSelectedIntervalStart = oAppointment.start,
					oSelectedIntervalEnd = oAppointment.end,
					oDateTimePickerStart = this.byId("startDate"),
					oDateTimePickerEnd = this.byId("endDate"),
					sSelectedInfo = oAppointment.info,
					sSelectedMd = oAppointment.md,
					sSelectedTitle = oAppointment.title,
					iSelectedPersonId = this.sPath[this.sPath.indexOf("/people/") + "/people/".length],
					oPersonSelected = this.byId("selectPerson"),
					oStartDate = this.byId("startDate"),
					oEndDate = this.byId("endDate"),
					oMoreInfoInput = this.byId("moreInfo"),
					oMdInput = this.byId("md"),
					oTitleInput = this.byId("inputTitle"),
					oAppointmentType = this.byId("isIntervalAppointment");

				oPersonSelected.setSelectedIndex(iSelectedPersonId);

				oStartDate.setDateValue(oSelectedIntervalStart);

				oEndDate.setDateValue(oSelectedIntervalEnd);

				oMoreInfoInput.setValue(sSelectedInfo);

				oMdInput.setValue(sSelectedMd);

				oTitleInput.setValue(sSelectedTitle);

				oDateTimePickerStart.setValueState(ValueState.None);
				oDateTimePickerEnd.setValueState(ValueState.None);

				oAppointmentType.setSelected(false);
			},

			_handleSingleAppointment: function (oAppointment) {
				var oView = this.getView();
				if (oAppointment === undefined) {
					return;
				}

				if (!oAppointment.getSelected() && this._pDetailsPopover) {
					this._pDetailsPopover.then(function(oDetailsPopover){
						oDetailsPopover.close();
					});
					return;
				}

				if (!this._pDetailsPopover) {
					this._pDetailsPopover = Fragment.load({
						id: oView.getId(),
						name: "sap.m.sample.test4.Details",
						controller: this
					}).then(function(oDetailsPopover){
						oView.addDependent(oDetailsPopover);
						return oDetailsPopover;
					});
				}

				this._pDetailsPopover.then(function(oDetailsPopover){
					this._setDetailsDialogContent(oAppointment, oDetailsPopover);
				}.bind(this));
			},

			_setDetailsDialogContent: function(oAppointment, oDetailsPopover){
				oDetailsPopover.setBindingContext(oAppointment.getBindingContext());
				oDetailsPopover.openBy(oAppointment);
			},

			formatDate: function (oDate) {
				if (oDate) {
					var iHours = oDate.getHours(),
						iMinutes = oDate.getMinutes(),
						iSeconds = oDate.getSeconds();

					if (iHours !== 0 || iMinutes !== 0 || iSeconds !== 0) {
						return DateFormat.getDateTimeInstance({ style: "medium" }).format(oDate);
					} else  {
						return DateFormat.getDateInstance({ style: "medium" }).format(oDate);
					}
				}
			},

			_handleGroupAppointments: function (oEvent) {
				var aAppointments,
					sGroupAppointmentType,
					sGroupPopoverValue,
					sGroupAppDomRefId,
					bTypeDiffer;

				aAppointments = oEvent.getParameter("appointments");
				sGroupAppointmentType = aAppointments[0].getType();
				sGroupAppDomRefId = oEvent.getParameter("domRefId");
				bTypeDiffer = aAppointments.some(function (oAppointment) {
					return sGroupAppointmentType !== oAppointment.getType();
				});

				if (bTypeDiffer) {
					sGroupPopoverValue = aAppointments.length + " Appointments of different types selected";
				} else {
					sGroupPopoverValue = aAppointments.length + " Appointments of the same " + sGroupAppointmentType + " selected";
				}

				if (!this._oGroupPopover) {
					this._oGroupPopover = new Popover({
						title: "Group Appointments",
						content: new Label({
							text: sGroupPopoverValue
						})
					});
				} else {
					this._oGroupPopover.getContent()[0].setText(sGroupPopoverValue);
				}
				this._oGroupPopover.addStyleClass("sapUiContentPadding");
				this._oGroupPopover.openBy(document.getElementById(sGroupAppDomRefId));
			},
//----------------------------------------------------
			roles: {
				donna: "Donna Moore",
				manager: "manager",
				admin: "admin"
			},

			getUserRole: function() {
				//return this.roles[this.byId("userRole").getSelectedKey()];
				return this.roles.manager;
			},

			canModifyAppointments: function(sRole) {
				var sUserRole = this.getUserRole();

				if (sUserRole === this.roles.manager || sUserRole === this.roles.admin || sUserRole === sRole) {
					return true;
				}
			},

			handleAppointmentDragEnter: function(oEvent) {
				if (this.isAppointmentOverlap(oEvent, oEvent.getParameter("calendarRow"))) {
					oEvent.preventDefault();
				}
			},

			handleAppointmentDrop: function (oEvent) {
				var oAppointment = oEvent.getParameter("appointment"),
					oStartDate = oEvent.getParameter("startDate"),
					oEndDate = oEvent.getParameter("endDate"),
					oCalendarRow = oEvent.getParameter("calendarRow"),
					bCopy = oEvent.getParameter("copy"),
					sTitle = oAppointment.getTitle(),
					oModel = this.getView().getModel(),
					oAppBindingContext = oAppointment.getBindingContext(),
					oRowBindingContext = oCalendarRow.getBindingContext(),
					handleAppointmentDropBetweenRows = function () {
						var aPath = oAppBindingContext.getPath().split("/"),
							iIndex = aPath.pop(),
							sRowAppointmentsPath = aPath.join("/");

						oRowBindingContext.getObject().appointments.push(
							oModel.getProperty(oAppBindingContext.getPath())
						);

						oModel.getProperty(sRowAppointmentsPath).splice(iIndex, 1);
					};

				if (bCopy) { // "copy" appointment
					var oProps = Object.assign({}, oModel.getProperty(oAppointment.getBindingContext().getPath()));
					oProps.start = oStartDate;
					oProps.end = oEndDate;

					oRowBindingContext.getObject().appointments.push(oProps);
				} else { // "move" appointment
					oModel.setProperty("start", oStartDate, oAppBindingContext);
					oModel.setProperty("end", oEndDate, oAppBindingContext);

					if (oAppointment.getParent() !== oCalendarRow) {
						handleAppointmentDropBetweenRows();
					}
				}

				oModel.refresh(true);

				MessageToast.show(oCalendarRow.getTitle() + "'s '" + "Appointment '" + sTitle + "' now starts at \n" + oStartDate + "\n and end at \n" + oEndDate + ".");
			},

			handleAppointmentResize: function (oEvent) {
				var oAppointment = oEvent.getParameter("appointment"),
					oStartDate = oEvent.getParameter("startDate"),
					oEndDate = oEvent.getParameter("endDate");

				if (!this.isAppointmentOverlap(oEvent, oAppointment.getParent())) {
					MessageToast.show("Appointment '" + oAppointment.getTitle() + "' now starts at \n" + oStartDate + "\n and end at \n" + oEndDate + ".");

					oAppointment
						.setStartDate(oStartDate)
						.setEndDate(oEndDate);
				} else {
					MessageToast.show("As a manager you can not resize events if they overlap with another events");
				}
			},
			isAppointmentOverlap: function (oEvent, oCalendarRow) {
				var oAppointment = oEvent.getParameter("appointment"),
					oStartDate = oEvent.getParameter("startDate"),
					oEndDate = oEvent.getParameter("endDate"),
					bAppointmentOverlapped;

				if (this.getUserRole() === this.roles.manager) {
					bAppointmentOverlapped = oCalendarRow.getAppointments().some(function (oCurrentAppointment) {
						if (oCurrentAppointment === oAppointment) {
							return;
						}

						var oAppStartTime = oCurrentAppointment.getStartDate().getTime(),
							oAppEndTime = oCurrentAppointment.getEndDate().getTime();

						if (oAppStartTime <= oStartDate.getTime() && oStartDate.getTime() < oAppEndTime) {
							return true;
						}

						if (oAppStartTime < oEndDate.getTime() && oEndDate.getTime() <= oAppEndTime) {
							return true;
						}

						if (oStartDate.getTime() <= oAppStartTime && oAppStartTime < oEndDate.getTime()) {
							return true;
						}
					});
				}

				return bAppointmentOverlapped;
			},
			handleInDev: function (oEvent) {
					MessageToast.show("Пока в разработке!");
			}
		});

	});
