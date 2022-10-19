<script runat="server">
    Platform.Load("core", "1.1.1");
    var api = new Script.Util.WSProxy();
    
    try {
    	/***************************/
    	/****** Define values ******/
    	/***************************/
        var myEmailAddress = "stefan_b@persistent.com";
        var myTriggeredSendDefinition = '207210';
        var myTriggeredSend = false;
        
    	/***************************/
    	/****** Delete Content *****/
    	/***************************/
        var rows = Platform.Function.DeleteData('PausedAutomations',['Status'],['4']);
        var rows = Platform.Function.DeleteData('PausedAutomations',['Status'],['8']);
    
    	/*********************************/
    	/****** Retrieve DE for loop *****/
    	/*********************************/
        var dataExtensionName = "Automations";

        var req = api.retrieve("DataExtension", ["CustomerKey"], {
            Property: "Name",
            SimpleOperator: "equals",
            Value: dataExtensionName
        });

        var customerKey = req.Results[0].CustomerKey;

        var result = api.retrieve(
            "DataExtensionObject[" + customerKey + "]", 
            ["External_Key", "Name","PLACEHOLDER"]
        );

        Write(Stringify(result.Results[0]));

        var length = result.Results.length;

        for (i = 0; i < length; i++) {
			/* Retrieve Status of automations*/
			var automationCustomerKey = result.Results[i].Properties[0].Value;
			var myName = result.Results[i].Properties[1].Value;

			/* Set value for retrieve request*/
			var rr = Platform.Function.CreateObject("RetrieveRequest");
			Platform.Function.SetObjectProperty(rr, "ObjectType", "Automation");
			Platform.Function.AddObjectArrayItem(rr, "Properties", "ProgramID");
			Platform.Function.AddObjectArrayItem(rr, "Properties", "CustomerKey");
			Platform.Function.AddObjectArrayItem(rr, "Properties", "Status");
			Platform.Function.AddObjectArrayItem(rr, "Properties", "Name");

			/* Retreive data based on CustomerKey*/
			var sfp = Platform.Function.CreateObject("SimpleFilterPart");
			Platform.Function.SetObjectProperty(sfp, "Property", "CustomerKey");
			Platform.Function.SetObjectProperty(sfp, "SimpleOperator", "equals");
			Platform.Function.AddObjectArrayItem(sfp, "Value", automationCustomerKey);

			Platform.Function.SetObjectProperty(rr, "Filter", sfp);

			var retrieveStatus = [0,0,0];

			var automationResultSet = Platform.Function.InvokeRetrieve(rr, retrieveStatus);

			/* Store retrieved data in variables */
			var ObjectID = automationResultSet[0]["ObjectID"];
			var Status = automationResultSet[0]["Status"];
			var automationName = automationResultSet[0]["Name"];

			/* Push vars to ampscript */
			Variable.SetValue("@ObjectID",(ObjectID));
			Variable.SetValue("@Status",(Status));
			Variable.SetValue("@automationName",(automationName));

			Write("<br>ObjectID: " + ObjectID);
			Write("<br>Status: " + Status);
			Write("<br>automationName: " + automationName);

			/* Enable Triggered Send and write data in de if automation is paused*/
            if (Status == "4" || Status == "8") {
                myTriggeredSend = true

                var dataExtensionName2 = "PausedAutomations";

                var req2 = api.retrieve("DataExtension", ["CustomerKey"], {
                    Property: "Name",
                    SimpleOperator: "equals",
                    Value: dataExtensionName2
                });

                var customerKey2 = req2.Results[0].CustomerKey;

                var props = [
                    {
                        "Name": "AutomationKey",
                        "Value": ObjectID
                    },
                    {
                        "Name": "AutomationName",
                        "Value": automationName
                    },
                    {
                        "Name": "Status",
                        "Value": Status
                    },
                    {
                        "Name": "PLACEHOLDER",
                        "Value": "1"
                    }
                ];

                var result2 = api.createItem('DataExtensionObject', {
                    CustomerKey: customerKey2,
                    Properties: props
                });

            }

                /*
                Code Status
                -1   Error
                 0   BuildingError
                 1   Building
                 2   Ready
                 3   Running
                 4   Paused
                 5   Stopped
                 6   Scheduled
                 7   Awaiting Trigger
                 8   InactiveTrigger
                */
     
        }
    	/***************************/
    	/****** Triggered Send *****/
    	/***************************/
        if (myTriggeredSend == true){
            /*Triggered Send*/
            var data = {
                subscriber : {
                    EmailAddress: myEmailAddress,
                    SubscriberKey: myEmailAddress
                }
            }
            
            var TSD = TriggeredSend.Init(myTriggeredSendDefinition);
            var Status = TSD.Send(data.subscriber,data.attributes);


        }
        
    } catch(error) {
        Write(Stringify(error));
    }   
</script>