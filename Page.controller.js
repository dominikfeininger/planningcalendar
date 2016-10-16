sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel', './DataProvider'],
    function (Controller, JSONModel, Model) {
        "use strict";

        var PageController = Controller.extend("sap.m.sample.PlanningCalendar.Page", {

            onInit: function () {

                var dataProvider = new DataProvider();

                // create model
                var oModel = new JSONModel();
                oModel.setData(dataProvider.getModel());

                window.oModel = oModel;

                this.getView().setModel(window.oModel);

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
            }

        });

        return PageController;

    });