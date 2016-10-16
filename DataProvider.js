/**
 *
 */
sap.ui.define([
    "sap/ui/base/ManagedObject",
    "sap/ui/model/json/JSONModel",
    "./chance"
], function (ManagedObject, JSONModel) {
    "use strict";

    /**
     *
     */
    return ManagedObject.extend("DataProvider", {

        /**
         *
         * @returns {*}
         */
        getModel: function () {

            var time = 8;

            //date
            var today = new Date(new Date(new Date(new Date().setHours("0")).setSeconds("0")).setMinutes("0"))
            var todayEnd = new Date(new Date(new Date(new Date().setHours("23")).setSeconds("59")).setMinutes("59"));
            var tomorrowEnd = new Date(todayEnd.setDate(todayEnd.getDate() + 4));
            var tomorrow = new Date(today.setDate(today.getDate() + 4));
            var tomorrow1End = new Date(todayEnd.setDate(todayEnd.getDate() + 5));
            var tomorrow1 = new Date(today.setDate(today.getDate() + 5));

            var centerBegin = tomorrow;
            var centerEnd = tomorrowEnd;

            var getHour = function () {

                var appointment1 = {
                    start: tomorrow,
                    end: tomorrowEnd,
                    visible: false
                }
                var ap2 = {
                    start: tomorrow1,
                    end: tomorrow1End
                };

                var hourA = {
                    name: time + ":00 Uhr",
                    appointments: [
                        appointment1
                    ]
                };

                var hour = {
                    name: time + ":00 Uhr",
                };

                time = time + 1;

                return hourA;


            };


            var getAppointments = function () {
                var appointments = {
                    start: centerBegin,
                    end: centerEnd
                };
                return appointments;
            };

            var today = new Date();

            var day1 = chance.unique(getHour, 12);
            var a = chance.unique(getAppointments, 1);

            return {
                startDate: new Date(today.setDate(today.getDate())),
                hours: day1
            };
        }

    });

});