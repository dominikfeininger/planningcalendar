sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel', './DataProvider', 'sap/m/MessagePopover', 'sap/m/MessagePopoverItem'],
    function (Controller, JSONModel, Model, MessagePopover, MessagePopoverItem) {
        "use strict";


        var oMessageTemplate = new MessagePopoverItem({
            type: 'Information',
            title: 'Information message',
            description: 'First Information message description',
            subtitle: 'Example of subtitle',
            counter: 1
        });

        var oMessagePopover1 = new MessagePopover({
            items: {
                template: oMessageTemplate
            },

        });

        var PageController = Controller.extend("sap.m.sample.PlanningCalendar.Page", {

            onInit: function () {

                var _self = this;

                var dataProvider = new DataProvider();

                // create model
                var oModel = new JSONModel();

                // set structure
                oModel.setData(dataProvider.getAllDay(), true);

                // get Date
                var p = dataProvider.getJson("appointments.json");

                // returns promise
                p.then(function (data) {

                    // set Model
                    oModel.setData(data, true);

                    // for testing
                    window.oModel = oModel;

                    // set Model
                    _self.getView().setModel(window.oModel);
                });

            },

            rowSelectionChange: function () {
                console.log("rowSelectionChange");
            },

            handleMessagePopoverPress1: function (oEvent) {
                
                //oMessagePopover1.openBy(oEvent.mParameters.row);
            },

            addAppointment: function (oEvent) {
                var oPC = oEvent.oSource;
                var oDate = oEvent.getParameter("startDate");
                var oSTime = oEvent.getParameter("startTime");
                var oETime = oEvent.getParameter("endTime");
                var oRow = oEvent.getParameter("row");
                var oModel = this.getView().getModel();
                var oData = oModel.getData();
                var oAppointment = {
                    startTime: new Date().getHours()+":"+new Date().getMinutes(),
                    endTime: new Date().getHours()+1+":"+new Date().getMinutes(),
                    date: oDate.getFullYear()+"-"+(oDate.getMonth()+1)+"-"+oDate.getDate(),
                    type: "Type04"
                };

                oData.hours[0].appointments.push(oAppointment);

                oModel.setData(oData);

            },

            openNewAppointmentPopup: function(){
                // open popup
                var openingElement = sap.ui.getCore().byId("__appointment0-__row0-__xmlview0--PC1-0-"+oData.hours[0].appointments.length);
                this.handleMessagePopoverPress1(openingElement);        
            },

            /**
             *
             */
            handleIntervalSelect: function (oEvent) {
                this.addAppointment(oEvent);
            },

            /**
             *
             * @param oEvent
             */
            handleAppointmentSelect: function (oEvent) {
                var oAppointment = oEvent.getParameter("appointment");
                if (oAppointment) {
                    console.log("Appointment selected: " + oAppointment.getTitle());
                } else {
                    var aAppointments = oEvent.getParameter("appointments");
                    var sValue = aAppointments.length + " Appointments selected";
                    console.log(sValue);
                }
            },

            // ------------------------- formatter ------------------ //

            dateFormatter: function (date) {
                return new Date(date);
            },

            dateStartFormatter: function (date) {
                var dayStart = new Date(new Date(new Date(new Date(date).setHours("0")).setSeconds("0")).setMinutes("0"))
                return dayStart;
            },

            dateEndFormatter: function (date) {
                var dayEnd = new Date(new Date(new Date(new Date(date).setHours("23")).setSeconds("59")).setMinutes("59"))
                return dayEnd;
            },

            timeFormatter: function (time) {
                return time;
            }

        });

        return PageController;

    });