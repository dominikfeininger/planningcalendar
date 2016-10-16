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

        getJson: function(path){
            var promise = $.getJSON(path);

            promise.done(function(data) {
               return data;
            });

            return promise;
        },

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

            var centerBegin = today;
            var centerEnd = tomorrowEnd;

            var getHour = function () {

                var appointment1 = {
                    start: tomorrow,
                    end: tomorrowEnd
                };

                var hourA = {
                    name: time + ":00 Uhr",
                    appointments: [
                        appointment1
                    ]
                };

                time = time + 1;

                return hourA;
            };

            var today = new Date();

            var hours = chance.unique(getHour, 12);

                var a = {
                    start: centerBegin,
                    end: todayEnd,
                    type: "Type04",
                };

            hours[0].appointments.push(a);

            return {
                startDate: new Date(tomorrow.setDate(tomorrow.getDate())),
                hours: hours
            };
        }

    });

});