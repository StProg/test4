sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui"
], function(Controller, JSONModel, Toast) {
    "use strict";

    return Controller.extend("sap.ui.web.main.sample.StepInput.C", {

        onInit: function() {
            var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
            this.getView().setModel(oModel);
        },
        handleChange: function(oEvent) {
            var demoToast = this.getView().byId("demoToast");
            demoToast.setText("Value changed to " + oEvent.getParameter("value"));
            demoToast.show();
        }

    });
});