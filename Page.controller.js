sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel', './DataProvider'],
    function (Controller, JSONModel, Model) {
        "use strict";

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