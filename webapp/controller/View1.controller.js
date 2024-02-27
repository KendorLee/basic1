sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "basic1/utils/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox"

],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, formatter, Filter, FilterOperator, MessageBox) {
        "use strict";

        return Controller.extend("basic1.controller.View1", {
            customFormatter: formatter,            
            onInit: function () {

                MessageBox.show("onInit is called");
                /* Sin "datasource" y sin "model" en manifest.json  
                let oModel = new sap.ui.model.json.JSONModel("../model/products.json");
                this.getView().setModel(oModel);

                var oQuestionModel = this.getView().getModel();
                oQuestionModel.getProperty("/ProductCollection");

                NOTA: Con esta opcion algunos METHODS no funcionan!

*/
                /* Con "datasource" y con "model" en manifest.json*/
                
                var xOwner = this.getOwnerComponent();
                var oModel = this.getOwnerComponent().getModel("inventoryItemsModel");
                var ProductCollection = oModel.getProperty("/ProductCollection");
/*
                    "dataSources": {
                    "inventoryJSONData": {
                        "uri": "model/products.json",
                        "type": "JSON"
                    }
                    }                
                    "models": {
                    "inventoryItemsModel": {
                        "type": "sap.ui.model.json.JSONModel",
                        "dataSource": "inventoryJSONData"
                    }
                    },                
                */
    
                    // oModel.setProperty("/ProductCollection", ProductCollection);
                     console.log(oModel.getData());
            },
            handleEditButton: function (oEvent) {
                var sPath = oEvent.getSource().getBindingContext('inventoryItemsModel').getPath();
                var oModel = this.getView().getModel("inventoryItemsModel");
                oModel.setProperty(sPath + "/Editable", true);
            },
            handleCancelButton: function (oEvent) {
                MessageBox.show("handleCancelButton is called");                
                var sPath = oEvent.getSource().getBindingContext('inventoryItemsModel').getPath();
                var oModel = this.getView().getModel("inventoryItemsModel");

                // Create a deep copy of the original data when entering edit mode
                oModel.setProperty(sPath + "/OriginalData", JSON.parse(JSON.stringify(oModel.getProperty(sPath))));
                oModel.setProperty(sPath + "/Editable", true);

                oModel.setProperty(sPath + "/Editable", false); // Set the "Editable" property back to false
                console.log(oModel.getData())
            },

            handleSaveButton: function (oEvent) {
                MessageBox.show("handleSaveButton is called");                  
                var sPath = oEvent.getSource().getBindingContext('inventoryItemsModel').getPath();
                var oModel = this.getView().getModel("inventoryItemsModel");
                oModel.setProperty(sPath + "/Editable", false);
                console.log(oModel.getData());
            },

            handleDeleteButton: function (oEvent) {
                MessageBox.show("handleDeleteButton is called");                     
                var oRow = oEvent.getSource().getParent().getParent();
                var oModel = this.getView().getModel("inventoryItemsModel");
                var sPathObject = oRow.getBindingContext("inventoryItemsModel").getObject();
                var aProductCollection = oModel.getProperty("/ProductCollection");
                var getNumberOfItemsText = this.getView().byId('itemsCount');


                // Find the index of the item to delete
                var iIndex = aProductCollection.findIndex(function (oItem) {
                    return oItem === sPathObject;
                });

                // Remove the item from the array
                aProductCollection.splice(iIndex, 1);

                // Update the model to reflect the changes
                oModel.setProperty("/ProductCollection", aProductCollection);
                // console.log(oModel.getData());
            },

            handleOpenDialog: function (oEvent) {
                MessageBox.show("handleOpenDialog is called");     
                //OPENING THE DIALOG AND BINDING THE DATA
                var sPath = oEvent.getSource().getBindingContext('inventoryItemsModel').getPath();
                if (!this.productInfoDialog) {
                    this.loadFragment({
                        name: "inventory.fragments.productInfoDialog"
                    }).then(function (oDialog) {
                        this.productInfoDialog = oDialog;
                        this.productInfoDialog.bindElement({
                            path: sPath,
                            model: "inventoryItemsModel"
                        });
                        this.productInfoDialog.open();
                    }.bind(this));
                } else {
                    this.productInfoDialog.bindElement({
                        path: sPath,
                        model: "inventoryItemsModel"
                    });
                    this.productInfoDialog.open();
                }
            },

            handleCloseDialog: function () {
                MessageBox.show("handleCloseDialog is called");                     
                this.productInfoDialog.close();
            },

            handleGetJsonModel: function () {
                MessageBox.show("handleGetJsonModel is called");                     

                var oModel = this.getOwnerComponent().getModel("inventoryItemsModel");
                //Getting Data from Model
                var data = oModel.getData();
                console.log(data);
            },
            handleSearchFilter: function (oEvent) {
                MessageBox.show("handleSearchFilter is called");                     

                // build filter array
                var aFilter = [];
                var sQuery = oEvent.getParameter("newValue"); //THE SEARCH TERM ENTERED IS STORED IN THE 'query' PROPERTY of oEvent Object
                if (sQuery) {
                    //Creating new filter 
                    var newFilter = new Filter({
                        path: "Category",
                        operator: FilterOperator.Contains,
                        value1: sQuery
                    })
                    aFilter.push(newFilter);
                    // aFilter.push(new Filter("Category", FilterOperator.Contains, sQuery));
                }

                // filter binding
                var oTable = this.byId("Table1");
                var oBinding = oTable.getBinding("items");
                oBinding.filter(aFilter);

                // Update the count based on the filtered items
                var iFilteredItems = oBinding.getLength();
                this.getView().byId("itemsCount").setText("(" + iFilteredItems + ")");
            }            


        });
    });
