
jQuery.sap.declare("sov.cal.CalendarRow");

sap.ui.define(["jquery.sap.global", "sap/ui/unified/CalendarRow"],

    function (jQuery, SuperControl) {
        "use strict";

        /**
         *
         * @type {any}
         */
        var CalendarRow = SuperControl.extend("sov.cal.CalendarRow", {

            renderer:{

                renderAppointment : function(oRm, oRow, oAppointmentInfo, aTypes) {

                    var oAppointment = oAppointmentInfo.appointment;
                    var sTooltip = oAppointment.getTooltip_AsString();
                    var sType = oAppointment.getType();
                    var sTitle = oAppointment.getTitle();
                    var sText = oAppointment.getText();
                    var sIcon = oAppointment.getIcon();
                    var sId = oAppointment.getId();
                    var mAccProps = {labelledby: {value: sap.ui.unified.CalendarRow._oStaticAppointmentText.getId() + " " + sId + "-Descr", append: true}};
                    var aAriaLabels = oRow.getAriaLabelledBy();

                    if (aAriaLabels.length > 0) {
                        mAccProps["labelledby"].value = mAccProps["labelledby"].value + " " + aAriaLabels.join(" ");
                    }

                    if (sTitle) {
                        mAccProps["labelledby"].value = mAccProps["labelledby"].value + " " + sId + "-Title";
                    }

                    if (sText) {
                        mAccProps["labelledby"].value = mAccProps["labelledby"].value + " " + sId + "-Text";
                    }

                    oRm.write("<div");
                    oRm.writeElementData(oAppointment);
                    oRm.addClass("sapUiCalendarApp");

                    if (oAppointment.getSelected()) {
                        oRm.addClass("sapUiCalendarAppSel");
                        mAccProps["selected"] = true;
                    }

                    if (oAppointment.getTentative()) {
                        oRm.addClass("sapUiCalendarAppTent");
                        mAccProps["labelledby"].value = mAccProps["labelledby"].value + " " + sap.ui.unified.CalendarRow._oStaticTentativeText.getId();
                    }

                    if (!sText) {
                        oRm.addClass("sapUiCalendarAppTitleOnly");
                    }

                    if (sIcon) {
                        oRm.addClass("sapUiCalendarAppWithIcon");
                    }

                    // write position
                    if (oRow._bRTL) {
                        oRm.addStyle("right", oAppointmentInfo.begin + "%");
                        oRm.addStyle("left", oAppointmentInfo.end + "%");
                    } else {
                        oRm.addStyle("left", oAppointmentInfo.begin + "%");
                        oRm.addStyle("right", oAppointmentInfo.end + "%");
                    }

                    // ------------------------ time calculation ------------------ //

                    // FIXME:
                    // write top and bottom
                    var startTime = oAppointmentInfo.appointment.mProperties.startTime;
                    var endTime = oAppointmentInfo.appointment.mProperties.endTime;

                    var pixel = 49;

                    var shour = (startTime.substr(0,2)-9) * pixel;
                    var smin = startTime.substr(3,5) * (pixel/60);

                    var ehour = (endTime.substr(0,2)-9) * pixel;
                    var emin = endTime.substr(3,5) * (pixel/60);

                    oRm.addStyle("top", shour+smin + "px");
                    oRm.addStyle("height", ehour+emin + "px");

                    // ------------------------ time calculation ------------------ //

                    oRm.writeAttribute("data-sap-level", oAppointmentInfo.level);

                    // This makes the appointment focusable
                    if (oRow._sFocusedAppointmentId == sId) {
                        oRm.writeAttribute("tabindex", "0");
                    } else {
                        oRm.writeAttribute("tabindex", "-1");
                    }

                    if (sTooltip) {
                        oRm.writeAttributeEscaped("title", sTooltip);
                    }

                    if (sType && sType != sap.ui.unified.CalendarDayType.None) {
                        oRm.addClass("sapUiCalendarApp" + sType);
                    }

                    oRm.writeAccessibilityState(oAppointment, mAccProps);

                    oRm.writeClasses();
                    oRm.writeStyles();
                    oRm.write(">"); // div element

                    // extra content DIV to make some styling possible
                    oRm.write("<div");
                    oRm.addClass("sapUiCalendarAppCont");
                    oRm.writeClasses();
                    oRm.write(">"); // div element

                    if (sIcon) {
                        var aClasses = ["sapUiCalendarAppIcon"];
                        var mAttributes = {};

                        mAttributes["id"] = sId + "-Icon";
                        mAttributes["title"] = null;
                        oRm.writeIcon(sIcon, aClasses, mAttributes);
                    }

                    if (sTitle) {
                        oRm.write("<span");
                        oRm.writeAttribute("id", sId + "-Title");
                        oRm.addClass("sapUiCalendarAppTitle");
                        oRm.writeClasses();
                        oRm.write(">"); // span element
                        oRm.writeEscaped(sTitle, true);
                        oRm.write("</span>");
                    }

                    if (sText) {
                        oRm.write("<span");
                        oRm.writeAttribute("id", sId + "-Text");
                        oRm.addClass("sapUiCalendarAppText");
                        oRm.writeClasses();
                        oRm.write(">"); // span element
                        oRm.writeEscaped(sText, true);
                        oRm.write("</span>");
                    }

                    // ARIA information about start and end
                    var sAriaText = oRow._oRb.getText("CALENDAR_START_TIME") + ": " + oRow._oFormatAria.format(oAppointment.getStartDate());
                    sAriaText = sAriaText + "; " + oRow._oRb.getText("CALENDAR_END_TIME") + ": " + oRow._oFormatAria.format(oAppointment.getEndDate());
                    if (sTooltip) {
                        sAriaText = sAriaText + "; " + sTooltip;
                    }

                    if (sType && sType != sap.ui.unified.CalendarDayType.None) {
                        // as legend must not be rendered add text of type
                        for (var i = 0; i < aTypes.length; i++) {
                            var oType = aTypes[i];
                            if (oType.getType() == sType) {
                                sAriaText = sAriaText + "; " + oType.getText();
                                break;
                            }
                        }
                    }

                    oRm.write("<span id=\"" + sId + "-Descr\" class=\"sapUiInvisibleText\">" + sAriaText + "</span>");

                    oRm.write("</div>");
                    oRm.write("</div>");
                }
            }

        });

        return CalendarRow;
    }, true);
