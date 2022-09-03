import * as core from "@actions/core";
import * as crypto from "crypto";
import { ContainerAppsAPIClient, ContainerApp} from "@azure/arm-appcontainers";
import { TokenCredential, DefaultAzureCredential} from "@azure/identity";

import { TaskParameters } from "./taskparameters";

var prefix = !!process.env.AZURE_HTTP_USER_AGENT ? `${process.env.AZURE_HTTP_USER_AGENT}` : "";

async function main() {

    try {
        // Set user agent variable
        let usrAgentRepo = crypto.createHash('sha256').update(`${process.env.GITHUB_REPOSITORY}`).digest('hex');
        let actionName = 'DeployAzureContainerApp';
        let userAgentString = (!!prefix ? `${prefix}+` : '') + `GITHUBACTIONS_${actionName}_${usrAgentRepo}`;
        core.exportVariable('AZURE_HTTP_USER_AGENT', userAgentString);

        var taskParams = TaskParameters.getTaskParams();
        let credential: TokenCredential = new DefaultAzureCredential()

        console.log("Predeployment Steps Started");
        const client = new ContainerAppsAPIClient(credential, taskParams.subscriptionId);

        const containerAppEnvelope: ContainerApp = {
            location: "East US",
            managedEnvironmentId:
              "/subscriptions/a4deccb1-a1f6-40cb-a923-f55a7d22c32d/resourceGroups/sample-rg/providers/Microsoft.App/managedEnvironments/my-container-env",
            template: {
              containers: [
                {
                  name: "simple-hello-world-container",
                  image: "mcr.microsoft.com/azuredocs/containerapps-helloworld:latest",
                }
              ],
            }
          };

        console.log("Deployment Step Started");
        console.log(containerAppEnvelope);

        let containerAppDeploymentResult = await client.containerApps.beginCreateOrUpdate(
            taskParams.resourceGroup, 
            taskParams.containerAppName, 
            containerAppEnvelope,
            );
        
        console.log("Result raw");
        console.log(containerAppDeploymentResult);
        console.log("Result 2");
        console.log(containerAppDeploymentResult.pollUntilDone());
        console.log("Result");
        console.log(containerAppDeploymentResult.toString());
        console.log("operation state");
        console.log(containerAppDeploymentResult.getOperationState.toString());
        console.log("");
        console.log("is done");
        console.log(containerAppDeploymentResult.isDone.toString());
        console.log("");
        console.log("getResult");
        console.log(containerAppDeploymentResult.getResult()?.toString());
        console.log("");
        console.log("getResult");
        console.log(containerAppDeploymentResult.onProgress.toString());
        if(containerAppDeploymentResult.getOperationState.toString() == "Succeeded") {
            console.log("Deployment Succeeded.");
            //let appUrlWithoutPort = containerAppDeploymentResult.properties.ingress.fqdn;
            //let port = taskParams.ports[0].port;
            //let appUrl = "http://"+appUrlWithoutPort+":"+port.toString()+"/"
            //core.setOutput("app-url", appUrl);
            //console.log("Your App has been deployed at: "+appUrl);
            console.log("Deployment Result: "+containerAppDeploymentResult);
        } else {
            console.log("Deployment Result: "+containerAppDeploymentResult);
            throw Error("Container Deployment Failed"+containerAppDeploymentResult);
        }
    }
    catch (error) {
        console.log("Deployment Failed with Error: " + error);
        // core.setFailed(error);
    }
    finally{
        console.log("ERRRRROOR");
        // Reset AZURE_HTTP_USER_AGENT
        // core.exportVariable('AZURE_HTTP_USER_AGENT', prefix);
    }
}

//function getResources(taskParams: TaskParameters): ContainerInstanceManagementModels.ResourceRequirements {
//    if (taskParams.gpuCount) {
//        let resRequirements: ContainerInstanceManagementModels.ResourceRequirements = {
//            "requests": {
//                "cpu": taskParams.cpu,
//                "memoryInGB": taskParams.memory,
//                "gpu": {
//                    "count": taskParams.gpuCount,
//                    "sku": taskParams.gpuSku
//                }
//            }
//        }
//        return resRequirements;
//    } else {
//        let resRequirements: ContainerInstanceManagementModels.ResourceRequirements = {
//            "requests": {
//                "cpu": taskParams.cpu,
//                "memoryInGB": taskParams.memory
//            }
//        }
//        return resRequirements;
//    }
//}
//
//function getPorts(taskParams: TaskParameters): Array<ContainerInstanceManagementModels.Port> {
//    let ports = taskParams.ports;
//    ports.forEach((port) => {
//        port.protocol = taskParams.protocol;
//    });
//    return ports;
//}

main();