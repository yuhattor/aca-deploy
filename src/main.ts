import * as core from "@actions/core";
import * as crypto from "crypto";
import { ContainerAppsAPIClient, ContainerApp } from "@azure/arm-appcontainers";
import { TokenCredential, DefaultAzureCredential } from "@azure/identity";

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

    // TBD: Need to get subscriptionId not from taskParams, but from credential.
    let subscriptionId = taskParams.subscriptionId

    console.log("Predeployment Steps Started");
    const client = new ContainerAppsAPIClient(credential, taskParams.subscriptionId);

    const containerAppEnvelope: ContainerApp = {
      configuration: {
        dapr: { appPort: 3000, appProtocol: "http", enabled: true },
      },
      location: taskParams.location,
      managedEnvironmentId:
        `/subscriptions/${subscriptionId}/resourceGroups/${taskParams.resourceGroup}/providers/Microsoft.App/managedEnvironments/${taskParams.managedEnvironmentName}`,
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

    let containerAppDeploymentResult = await client.containerApps.beginCreateOrUpdateAndWait(
      taskParams.resourceGroup,
      taskParams.containerAppName,
      containerAppEnvelope,
    );

    console.log("Deployment Succeeded.");
    //let appUrlWithoutPort = containerAppDeploymentResult.properties.ingress.fqdn;
    //let port = taskParams.ports[0].port;
    //let appUrl = "http://"+appUrlWithoutPort+":"+port.toString()+"/"
    //core.setOutput("app-url", appUrl);
    //console.log("Your App has been deployed at: "+appUrl);
    console.log("Deployment Result: " + containerAppDeploymentResult);
  }
  catch (error: string | any) {
    console.log("Deployment Failed with Error: " + error);
    core.setFailed(error);
  }
  finally {
    // Reset AZURE_HTTP_USER_AGENT
    core.exportVariable('AZURE_HTTP_USER_AGENT', prefix);
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