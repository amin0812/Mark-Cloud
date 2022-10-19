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

        
        
    } catch(error) {
        Write(Stringify(error));
    }   
</script>