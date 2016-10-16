sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel', './DataProvider'],
    function (Controller, JSONModel, Model) {
        "use strict";

        var PageController = Controller.extend("sap.m.sample.PlanningCalendar.Page", {

            onInit: function () {

                var _self = this;

                var dataProvider = new DataProvider();

                // create model
                var oModel = new JSONModel();

                var p = dataProvider.getJson("Hours.json")

                p.then(function (data) {
                    oModel.setData(data);

                    window.oModel = oModel;

                    _self.getView().setModel(window.oModel);
                });

            },

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

            dateFormatter: function (date) {
                return new Date(date);
            },

        });

        return PageController;

    });