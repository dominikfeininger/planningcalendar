jQuery.sap.declare("sov.cal.PlanningCalendar");

sap.ui.define(["jquery.sap.global", "sap/m/PlanningCalendar", "./PlanningCalendarRow"],

    function (jQuery, SuperControl) {
        "use strict";

        /**
         *
         * @type {any}
         */
        var PlanningCalendar = SuperControl.extend("sov.cal.PlanningCalendar", {
            aggregations: {

                /**
                 * rows of the <code>PlanningCalendar</code>
                 */
                rows: {type: "sov.cal.PlanningCalendarRow", multiple: true, singularName: "row"},
            },

            renderer: {},

            init: function () {

                this._iBreakPointTablet = sap.ui.Device.media._predefinedRangeSets[sap.ui.Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[0];
                this._iBreakPointDesktop = sap.ui.Device.media._predefinedRangeSets[sap.ui.Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[1];
                this._iBreakPointLargeDesktop = sap.ui.Device.media._predefinedRangeSets[sap.ui.Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[2];

                if (sap.ui.Device.system.phone || jQuery('html').hasClass("sapUiMedia-Std-Phone")) {
                    this._iSize = 0;
                    this._iSizeScreen = 0;
                } else if (sap.ui.Device.system.tablet || jQuery('html').hasClass("sapUiMedia-Std-Tablet")) {
                    this._iSize = 1;
                    this._iSizeScreen = 1;
                } else {
                    this._iSize = 2;
                    this._iSizeScreen = 2;
                }

                this._oRB = sap.ui.getCore().getLibraryResourceBundle("sap.m");

                var sId = this.getId();
                this._oIntervalTypeSelect = new sap.m.Select(sId + "-IntType", {maxWidth: "15rem", ariaLabelledBy: sId + "-SelDescr"});

                this._oIntervalTypeSelect.attachEvent("change", _changeIntervalType, this);

                this._oTodayButton = new sap.m.Button(sId + "-Today", {
                    text: this._oRB.getText("PLANNINGCALENDAR_TODAY"),
                    type: sap.m.ButtonType.Transparent
                });
                this._oTodayButton.attachEvent("press", _handleTodayPress, this);

                this._oHeaderToolbar = new sap.m.Toolbar(sId + "-HeaderToolbar", {
                    design: sap.m.ToolbarDesign.Transparent,
                    content: [this._oIntervalTypeSelect, this._oTodayButton]
                });

                this._oCalendarHeader = new CalendarHeader(sId + "-CalHead", {
                    toolbar: this._oHeaderToolbar
                });

                this._oInfoToolbar = new sap.m.Toolbar(sId + "-InfoToolbar", {
                    height: "auto",
                    design: sap.m.ToolbarDesign.Transparent,
                    content: [this._oCalendarHeader, this._oTimeInterval]
                });

                var oTable = new sap.m.Table(sId + "-Table", {
                    infoToolbar: this._oInfoToolbar,
                    mode: sap.m.ListMode.SingleSelectMaster,
                    columns: [
                        new sap.m.Column({
                            styleClass: "sapMPlanCalRowHead"
                        }),
                        new sap.m.Column({
                            width: "80%",
                            styleClass: "sapMPlanCalAppRow",
                            minScreenWidth: sap.m.ScreenSize.xsmall,//sap.m.ScreenSize.Desktop,
                            demandPopin: true
                        })
                    ],
                    ariaLabelledBy: sId + "-Descr"
                });
                oTable.attachEvent("selectionChange", _handleTableSelectionChange, this);

                this.setAggregation("table", oTable, true);

                this.setStartDate(new Date());

                this._resizeProxy = jQuery.proxy(_handleResize, this);

            }

        });


        // -------------------------------- super functions --------------------- //


        function _changeIntervalType(oEvent) {

            this.setViewKey(oEvent.getParameter("selectedItem").getKey());

            this.fireViewChange();

        }

        function _handleTodayPress(oEvent) {

            this.setStartDate(new Date());

            this.fireStartDateChange();

        }

        function _handleStartDateChange(oEvent){

            if (this._bNoStartDateChange) {
                return;
            }

            var oStartDate = oEvent.oSource.getStartDate();

            this.setStartDate(new Date(oStartDate.getTime())); // use new Date object

            this.fireStartDateChange();

        }

        function _handleCalendarSelect(oEvent){

            var aSelectedDates = oEvent.oSource.getSelectedDates();
            var oStartDate = new Date(aSelectedDates[0].getStartDate());

            // remove old selection
            aSelectedDates[0].setStartDate();

            // calculate end date
            var oEndDate = CalendarUtils._createUniversalUTCDate(oStartDate, undefined, true);
            var sKey = this.getViewKey();
            var oView = _getView.call(this, sKey);
            var sIntervalType = oView.getIntervalType();

            switch (sIntervalType) {
                case sap.ui.unified.CalendarIntervalType.Hour:
                    oEndDate.setUTCHours(oEndDate.getUTCHours() + 1);
                    break;

                case sap.ui.unified.CalendarIntervalType.Day:
                    oEndDate.setUTCDate(oEndDate.getUTCDate() + 1);
                    break;

                case sap.ui.unified.CalendarIntervalType.Month:
                    oEndDate.setUTCMonth(oEndDate.getUTCMonth() + 1);
                    break;

                default:
                    throw new Error("Unknown IntervalType: " + sIntervalType + "; " + this);
            }

            oEndDate.setUTCMilliseconds(oEndDate.getUTCMilliseconds() - 1);
            oEndDate = CalendarUtils._createLocalDate(oEndDate, true);

            this.fireIntervalSelect({startDate: oStartDate, endDate: oEndDate, subInterval: false, row: undefined});

        }

        function _handleIntervalSelect(oEvent){

            var oStartDate = oEvent.getParameter("startDate");
            var oEndDate = oEvent.getParameter("endDate");
            var bSubInterval = oEvent.getParameter("subInterval");
            var oRow = oEvent.oSource._oPlanningCalendarRow;

            this.fireIntervalSelect({startDate: oStartDate, endDate: oEndDate, subInterval: bSubInterval, row: oRow});

        }

        function _handleResize(oEvent, bNoRowResize){

            if (oEvent.size.width <= 0) {
                // only if visible at all
                return;
            }

            var aRows = this.getRows();
            var oRow;
            var i = 0;

            var iOldSize = this._iSize;
            _determineSize.call(this, oEvent.size.width);
            if (iOldSize != this._iSize) {
                var sKey = this.getViewKey();
                var oView = _getView.call(this, sKey);
                var sIntervalType = oView.getIntervalType();
                var iIntervals = _getIntervals.call(this, oView);
                for (i = 0; i < aRows.length; i++) {
                    oRow = aRows[i];
                    var oCalendarRow = oRow.getCalendarRow();
                    if (iIntervals != oCalendarRow.getIntervals()) {
                        oCalendarRow.setIntervals(iIntervals);
                    } else {
                        oCalendarRow.handleResize();
                    }
                }

                switch (sIntervalType) {
                    case sap.ui.unified.CalendarIntervalType.Hour:
                        if (this._oTimeInterval && this._oTimeInterval.getItems() != iIntervals) {
                            this._oTimeInterval.setItems(iIntervals);
                        }
                        break;

                    case sap.ui.unified.CalendarIntervalType.Day:
                        if (this._oDateInterval && this._oDateInterval.getDays() != iIntervals) {
                            this._oDateInterval.setDays(iIntervals);
                        }
                        break;

                    case sap.ui.unified.CalendarIntervalType.Month:
                        if (this._oMonthInterval && this._oMonthInterval.getMonths() != iIntervals) {
                            this._oMonthInterval.setMonths(iIntervals);
                        }
                        break;

                    default:
                        throw new Error("Unknown IntervalType: " + sIntervalType + "; " + this);
                }

                _positionSelectAllCheckBox.call(this);
            }else if (!bNoRowResize) {
                for (i = 0; i < aRows.length; i++) {
                    oRow = aRows[i];
                    oRow.getCalendarRow().handleResize();
                }
            }

        }

        function _updateCurrentTimeVisualization(bUpdateRows){

            if (this._sUpdateCurrentTime) {
                jQuery.sap.clearDelayedCall(this._sUpdateCurrentTime);
                this._sUpdateCurrentTime = undefined;
            }

            if (bUpdateRows) {
                var aRows = this.getRows();
                for (var i = 0; i < aRows.length; i++) {
                    var oRow = aRows[i];
                    oRow.getCalendarRow().updateCurrentTimeVisualization();
                }
            }

            // set timer only if date is in visible area or one hour before
            var oNowDate = new Date();
            var oStartDate = this.getStartDate();
            var sKey = this.getViewKey();
            var oView = _getView.call(this, sKey);
            var sIntervalType = oView.getIntervalType();
            var iIntervals = _getIntervals.call(this, oView);
            var iTime = 0;
            var iStartTime = 0;
            var iEndTime = 0;

            switch (sIntervalType) {
                case sap.ui.unified.CalendarIntervalType.Hour:
                    iTime = 60000;
                    iStartTime = oStartDate.getTime() - 3600000;
                    iEndTime = oStartDate.getTime() + iIntervals * 3600000;
                    break;

                case sap.ui.unified.CalendarIntervalType.Day:
                    iTime = 1800000;
                    iStartTime = oStartDate.getTime() - 3600000;
                    iEndTime = oStartDate.getTime() + iIntervals * 86400000;
                    break;

                default:
                    iTime = -1; // not needed
                    break;
            }

            if (oNowDate.getTime() <= iEndTime && oNowDate.getTime() >= iStartTime && iTime > 0) {
                this._sUpdateCurrentTime = jQuery.sap.delayedCall(iTime, this, _updateCurrentTimeVisualization, [true]);
            }

        }

        function _handleAppointmentSelect(oEvent) {

            var oAppointment = oEvent.getParameter("appointment");
            var bMultiSelect = oEvent.getParameter("multiSelect");
            var aAppointments = oEvent.getParameter("appointments");

            if (!bMultiSelect) {
                // deselect appointments of other rows
                var aRows = this.getRows();
                for (var i = 0; i < aRows.length; i++) {
                    var oRow = aRows[i];
                    var oCalendarRow = oRow.getCalendarRow();
                    if (oEvent.oSource != oCalendarRow) {
                        var aRowAppointments = oRow.getAppointments();
                        for (var j = 0; j < aRowAppointments.length; j++) {
                            var oRowAppointment = aRowAppointments[j];
                            oRowAppointment.setSelected(false);
                        }
                    }
                }
            }

            this.fireAppointmentSelect({appointment: oAppointment, appointments: aAppointments, multiSelect: bMultiSelect});

        }

        function _handleTableSelectionChange(oEvent) {

            var aChangedRows = [];
            var aRows = this.getRows();

            for (var i = 0; i < aRows.length; i++) {
                var oRow = aRows[i];
                var oRowItem = oRow.getColumnListItem();
                var bSelected = oRowItem.getSelected();
                if (oRow.getSelected() != bSelected) {
                    oRow.setProperty("selected", bSelected, true);
                    aChangedRows.push(oRow);
                }

            }

            if (!this.getSingleSelection()) {
                _updateSelectAllCheckBox.call(this);
            }

            if (aChangedRows.length > 0) {
                this.fireRowSelectionChange({rows: aChangedRows});
            }

        }

        function _changeToolbar() {

            var oTable = this.getAggregation("table");

            if (this.getToolbarContent().length > 0) {
                if (!this._oToolbar) {
                    this._oToolbar = new sap.m.OverflowToolbar(this.getId() + "-Toolbar", {
                        design: sap.m.ToolbarDesign.Transpaent
                    });
                    this._oToolbar._oPlanningCalendar = this;
                    this._oToolbar.getContent = function() {
                        return this._oPlanningCalendar.getToolbarContent();
                    };
                }
                if (!oTable.getHeaderToolbar()) {
                    oTable.setHeaderToolbar(this._oToolbar);
                }
            } else if (oTable.getHeaderToolbar()) {
                oTable.setHeaderToolbar();
            }

            this._oToolbar.invalidate();

        }

        function _determineSize(iWidth) {

            if (iWidth < this._iBreakPointTablet) {
                this._iSize = 0; // phone
            } else if (iWidth < this._iBreakPointDesktop){
                this._iSize = 1; // tablet
            } else {
                this._iSize = 2; // desktop
            }

            // use header sizes, as m.Table uses this for it's resizing
            if (jQuery('html').hasClass("sapUiMedia-Std-Phone")) {
                this._iSizeScreen = 0;
            }else if (jQuery('html').hasClass("sapUiMedia-Std-Tablet")) {
                this._iSizeScreen = 1;
            }else {
                this._iSizeScreen = 2;
            }

        }

        function _getViews() {

            var aViews = this.getViews();

            if (aViews.length == 0) {
                if (!this._aViews) {
                    this._aViews = [];

                    var oViewHour = new sap.m.PlanningCalendarView(this.getId() + "-HourView", {
                        key: sap.ui.unified.CalendarIntervalType.Hour,
                        intervalType: sap.ui.unified.CalendarIntervalType.Hour,
                        description: this._oRB.getText("PLANNINGCALENDAR_HOURS"),
                        intervalsS: 6,
                        intervalsM: 6,
                        intervalsL: 12
                    });
                    this._aViews.push(oViewHour);

                    var oViewDay = new sap.m.PlanningCalendarView(this.getId() + "-DayView", {
                        key: sap.ui.unified.CalendarIntervalType.Day,
                        intervalType: sap.ui.unified.CalendarIntervalType.Day,
                        description: this._oRB.getText("PLANNINGCALENDAR_DAYS"),
                        intervalsS: 7,
                        intervalsM: 7,
                        intervalsL: 14
                    });
                    this._aViews.push(oViewDay);

                    var oViewMonth = new sap.m.PlanningCalendarView(this.getId() + "-MonthView", {
                        key: sap.ui.unified.CalendarIntervalType.Month,
                        intervalType: sap.ui.unified.CalendarIntervalType.Month,
                        description: this._oRB.getText("PLANNINGCALENDAR_MONTHS"),
                        intervalsS: 3,
                        intervalsM: 6,
                        intervalsL: 12
                    });
                    this._aViews.push(oViewMonth);
                }

                aViews = this._aViews;
            }

            return aViews;

        }

        function _getView(sKey, bNoError) {

            var aViews = _getViews.call(this);
            var oView;

            for (var i = 0; i < aViews.length; i++) {
                oView = aViews[i];
                if (oView.getKey() != sKey) {
                    oView = undefined;
                }else {
                    break;
                }
            }

            if (!oView && !bNoError) {
                throw new Error("PlanningCalendarView with key " + sKey + "not assigned " + this);
            }

            return oView;

        }

        function _updateSelectItems() {

            var aViews = _getViews.call(this);
            var aItems = this._oIntervalTypeSelect.getItems();
            var i = 0;
            var oItem;

            if (aViews.length < aItems.length) {
                for (i = aViews.length; i < aItems.length; i++) {
                    oItem = aItems[i];
                    this._oIntervalTypeSelect.removeItem(oItem);
                    oItem.destroy();
                }
            }

            for (i = 0; i < aViews.length; i++) {
                var oView = aViews[i];
                oItem = aItems[i];
                if (oItem) {
                    if (oItem.getKey() != oView.getKey() || oItem.getText() != oView.getDescription()) {
                        oItem.setKey(oView.getKey());
                        oItem.setText(oView.getDescription());
                        oItem.setTooltip(oView.getTooltip());
                    }
                } else {
                    oItem = new sap.ui.core.Item(this.getId() + "-" + i, {
                        key: oView.getKey(),
                        text: oView.getDescription(),
                        tooltip: oView.getTooltip()
                    });
                    this._oIntervalTypeSelect.addItem(oItem);
                }
            }

        }

        function _getIntervals(oView) {

            var iIntervals = 0;

            switch (this._iSize) {
                case 0:
                    iIntervals = oView.getIntervalsS();
                    break;

                case 1:
                    iIntervals = oView.getIntervalsM();
                    break;

                default:
                    iIntervals = oView.getIntervalsL();
                    break;
            }

            return iIntervals;

        }

        function _handleSelectAll(oEvent) {

            var bAll = oEvent.getParameter("selected");
            var aRows = this.getRows();

            if (bAll) {
                aRows = this.getRows().filter(function(oRow) {
                    return !oRow.getSelected();
                });
            }

            this.selectAllRows(bAll);

            this.fireRowSelectionChange({rows: aRows});

        }

        function _handleLeaveRow(oEvent){

            var oCalendarRow = oEvent.oSource;
            var sType = oEvent.getParameter("type");
            var aRows = this.getRows();
            var oRow;
            var oNewRow;
            var oAppointment;
            var oDate;
            var i = 0;
            var iIndex = 0;
            var oNewEvent;

            for (i = 0; i < aRows.length; i++) {
                oRow = aRows[i];
                if (oRow.getCalendarRow() == oCalendarRow) {
                    iIndex = i;
                    break;
                }
            }

            switch (sType) {
                case "sapup":
                    oAppointment = oCalendarRow.getFocusedAppointment();
                    oDate = oAppointment.getStartDate();

                    // get nearest appointment in row above
                    if (iIndex > 0) {
                        iIndex--;
                    }

                    oNewRow = aRows[iIndex];
                    oNewRow.getCalendarRow().focusNearestAppointment(oDate);

                    break;

                case "sapdown":
                    oAppointment = oCalendarRow.getFocusedAppointment();
                    oDate = oAppointment.getStartDate();

                    // get nearest appointment in row above
                    if (iIndex < aRows.length - 1) {
                        iIndex++;
                    }

                    oNewRow = aRows[iIndex];
                    oNewRow.getCalendarRow().focusNearestAppointment(oDate);

                    break;

                case "saphome":
                    if (iIndex > 0) {
                        oNewRow = aRows[0];

                        oNewEvent = new jQuery.Event(sType);
                        oNewEvent._bPlanningCalendar = true;

                        oNewRow.getCalendarRow().onsaphome(oNewEvent);
                    }

                    break;

                case "sapend":
                    if (iIndex < aRows.length - 1) {
                        oNewRow = aRows[aRows.length - 1];

                        oNewEvent = new jQuery.Event(sType);
                        oNewEvent._bPlanningCalendar = true;

                        oNewRow.getCalendarRow().onsapend(oNewEvent);
                    }

                    break;

                default:
                    break;
            }

        }

        function _updateSelectAllCheckBox() {

            if (this._oSelectAllCheckBox) {
                var aRows = this.getRows();
                var aSelectedRows = this.getSelectedRows();
                if (aRows.length == aSelectedRows.length && aSelectedRows.length > 0) {
                    this._oSelectAllCheckBox.setSelected(true);
                } else {
                    this._oSelectAllCheckBox.setSelected(false);
                }
            }

        }

        function _positionSelectAllCheckBox() {

            if (this.getSingleSelection()) {
                if (this._oCalendarHeader.getAllCheckBox()) {
                    this._oCalendarHeader.setAllCheckBox();
                }else if (this._oInfoToolbar.getContent().length > 2) {
                    this._oInfoToolbar.removeContent(this._oSelectAllCheckBox);
                }
            } else {
                if (!this._oSelectAllCheckBox) {
                    this._oSelectAllCheckBox = new sap.m.CheckBox(this.getId() + "-All", {
                        text: this._oRB.getText("COLUMNSPANEL_SELECT_ALL")
                    });
                    this._oSelectAllCheckBox.attachEvent("select", _handleSelectAll, this);
                }
                if (this._iSizeScreen < 2 || !this.getShowRowHeaders()) {
                    var iIndex = this._oInfoToolbar.indexOfContent(this._oSelectAllCheckBox);
                    if (this._iSizeScreen < 2) {
                        // on phone: checkbox below calendar
                        if (iIndex < this._oInfoToolbar.getContent().length - 1) {
                            this._oInfoToolbar.addContent(this._oSelectAllCheckBox);
                        }
                    } else if (iIndex < 0 || iIndex > 1) {
                        // one column on desktop: checkbox left of calendar
                        if (iIndex > 1) {
                            // as insertAggregation do not change position in aggregation
                            this._oInfoToolbar.removeContent(this._oSelectAllCheckBox);
                        }
                        this._oInfoToolbar.insertContent(this._oSelectAllCheckBox, 1);
                    }
                } else {
                    this._oCalendarHeader.setAllCheckBox(this._oSelectAllCheckBox);
                }
            }

        }

        function _handleRowChanged(oEvent) {

            if (oEvent.getParameter("name") == "selected") {
                _updateSelectAllCheckBox.call(this);
            }

        }

        function _setSelectionMode() {

            var oTable = this.getAggregation("table");
            var sMode = oTable.getMode();
            var sModeNew;

            if (this.getSingleSelection()) {
                if (!this.getShowRowHeaders() && this.getRows().length == 1) {
                    // if only one row is displayed without header - do not enable row selection
                    sModeNew = sap.m.ListMode.None;
                } else {
                    sModeNew = sap.m.ListMode.SingleSelectMaster;
                }
            } else {
                sModeNew = sap.m.ListMode.MultiSelect;
            }

            if (sMode != sModeNew) {
                oTable.setMode(sModeNew);
            }

        }


        // -------------------------------- super functions --------------------- //


        return PlanningCalendar;
    }, true);
