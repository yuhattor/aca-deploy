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

        // let endpoint: IAuthorizer = await AuthorizerFactory.getAuthorizer();
        // let bearerToken = await endpoint.getToken();
        // let creds = new TokenCredentials(bearerToken);
        var taskParams = TaskParameters.getTaskParams();
        let credential: TokenCredential = new DefaultAzureCredential()

        console.log("Predeployment Steps Started");
        const client = new ContainerAppsAPIClient(credential, taskParams.subscriptionId);

        const containerAppEnvelope: ContainerApp = {
            configuration: {
              dapr: { appPort: 3000, appProtocol: "http", enabled: true },
              //ingress: {
              //  customDomains: [
              //    {
              //      name: "www.my-name.com",
              //      bindingType: "SniEnabled",
              //      //certificateId:
              //      //  "/subscriptions/a4deccb1-a1f6-40cb-a923-f55a7d22c32d/resourceGroups/rg/providers/Microsoft.App/managedEnvironments/demokube/certificates/my-certificate-for-my-name-dot-com",
              //    },
              //    {
              //      name: "www.my-other-name.com",
              //      bindingType: "SniEnabled",
              //      //certificateId:
              //      //  "/subscriptions/a4deccb1-a1f6-40cb-a923-f55a7d22c32d/resourceGroups/rg/providers/Microsoft.App/managedEnvironments/demokube/certificates/my-certificate-for-my-other-name-dot-com",
              //    }
              //  ],
              //  external: true,
              //  targetPort: 3000,
              //  traffic: [
              //    {
              //      label: "production",
              //      revisionName: "testcontainerApp0-ab1234",
              //      weight: 100
              //    }
              //  ]
              //}
            },
            location: "east us",
            managedEnvironmentId:
              "/subscriptions/a4deccb1-a1f6-40cb-a923-f55a7d22c32d/resourceGroups/sample-rg/providers/Microsoft.App/managedEnvironments/testenv2",
            template: {
              containers: [
                {
                  name: "mynginx",
                  image: "nginx:latest",
                  //probes: [
                  //  {
                  //    type: "Liveness",
                  //    httpGet: {
                  //      path: "/health",
                  //      httpHeaders: [{ name: "Custom-Header", value: "Awesome" }],
                  //      port: 8080
                  //    },
                  //    initialDelaySeconds: 3,
                  //    periodSeconds: 3
                  //  }
                  //]
                }
              ],
              //scale: {
              //  maxReplicas: 5,
              //  minReplicas: 1,
              //  rules: [
              //    {
              //      name: "httpscalingrule",
              //      custom: { type: "http", metadata: { concurrentRequests: "50" } }
              //    }
              //  ]
              //}
            }
          };

        console.log("Deployment Step Started");

        let containerAppDeploymentResult = await client.containerApps.beginCreateOrUpdate(
            taskParams.resourceGroup, 
            taskParams.containerAppName, 
            containerAppEnvelope,
            );
        console.log("hey");
        console.log("hey");
        
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