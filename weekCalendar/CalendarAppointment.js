jQuery.sap.declare("sov.cal.CalendarAppointment");

sap.ui.define(["jquery.sap.global", "sap/ui/unified/CalendarAppointment"],

    function (jQuery, SuperControl) {
        "use strict";

        /**
         *
         * @type {any}
         */
        var CalendarAppointment = SuperControl.extend("sov.cal.CalendarAppointment", {
            metadata: {
                properties: {
                    startTime: "string",
                    endTime: "string",
                    date:"string",
                    visible:"string"
                },
            },

            init: function () {

            },

        });

        return CalendarAppointment;
    }, true);
