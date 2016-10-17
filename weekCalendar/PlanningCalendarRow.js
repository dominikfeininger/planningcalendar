jQuery.sap.declare("sov.cal.PlanningCalendarRow");

sap.ui.define(["jquery.sap.global", "sap/m/PlanningCalendarRow", "./CalendarRow"],

    function (jQuery, SuperControl, CalendarRow) {
        "use strict";

        /**
         *
         * @type {any}
         */
        var PlanningCalendarRow = SuperControl.extend("sov.cal.PlanningCalendarRow", {});

        PlanningCalendarRow.prototype.init = function () {

            var sId = this.getId();
            var oCalendarRowHeader = new CalenderRowHeader(sId + "-Head", {parentRow: this});
            var oCalendarRow = new CalendarRow(sId + "-CalRow", {
                checkResize: false,
                updateCurrentTime: false,
                ariaLabelledBy: sId + "-Head"
            });
            oCalendarRow._oPlanningCalendarRow = this;

            oCalendarRow.getAppointments = function () {

                if (this._oPlanningCalendarRow) {
                    return this._oPlanningCalendarRow.getAppointments();
                } else {
                    return [];
                }

            };

            oCalendarRow.getIntervalHeaders = function () {

                if (this._oPlanningCalendarRow) {
                    return this._oPlanningCalendarRow.getIntervalHeaders();
                } else {
                    return [];
                }

            };

            this._oColumnListItem = new sap.m.ColumnListItem(this.getId() + "-CLI", {
                cells: [oCalendarRowHeader,
                    oCalendarRow]
            });

        };

        return PlanningCalendarRow;
    }, true);
