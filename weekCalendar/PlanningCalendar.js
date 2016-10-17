
jQuery.sap.declare("sov.cal.PlanningCalendar");

sap.ui.define(["jquery.sap.global", "sap/m/PlanningCalendar", "./PlanningCalendarRow"],

    function (jQuery, SuperControl) {
        "use strict";

        /**
         *
         * @type {any}
         */
        var PlanningCalendar = SuperControl.extend("sov.cal.PlanningCalendar", {
            aggregations : {

                /**
                 * rows of the <code>PlanningCalendar</code>
                 */
                rows: {type: "sov.cal.PlanningCalendarRow", multiple: true, singularName: "row"},
            },

            renderer : {

            }
        });

        return PlanningCalendar;
    }, true);
