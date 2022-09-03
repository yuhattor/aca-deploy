import * as core from "@actions/core";
import * as crypto from "crypto";
import { ContainerAppsAPIClient, ContainerApp} from "@azure/arm-appcontainers";
import { TokenCredential, DefaultAzureCredential} from "@azure/identity";

import { TaskParameters } from "./taskparameters";

var prefix = !!process.env.AZURE_HTTP_USER_AGENT ? `${process.env.AZURE_HTTP_USER_AGENT}` : "";

async function main() {

    try {
        core.debug("Deployment Step Started 1 ");
        // Set user agent variable
        let usrAgentRepo = crypto.createHash('sha256').update(`${process.env.GITHUB_REPOSITORY}`).digest('hex');
        core.debug("Deployment Step Started 2");
        let actionName = 'DeployAzureContainerApp';
        core.debug("Deployment Step Started 3");
        let userAgentString = (!!prefix ? `${prefix}+` : '') + `GITHUBACTIONS_${actionName}_${usrAgentRepo}`;
        core.debug("Deployment Step Started 4");
        core.exportVariable('AZURE_HTTP_USER_AGENT', userAgentString);

        // let endpoint: IAuthorizer = await AuthorizerFactory.getAuthorizer();
        // let bearerToken = await endpoint.getToken();
        // let creds = new TokenCredentials(bearerToken);
        var taskParams = TaskParameters.getTaskParams();
        core.debug("Deployment Step Started 5");
        let credential: TokenCredential = new DefaultAzureCredential()
        core.debug("Deployment Step Started 6");

        core.debug("Predeployment Steps Started");
        const client = new ContainerAppsAPIClient(credential, taskParams.subscriptionId);
        core.debug("Deployment Step Started 7");

        const containerAppEnvelope: ContainerApp = {
            configuration: {
              dapr: { appPort: 3000, appProtocol: "http", enabled: true },
              ingress: {
                customDomains: [
                  {
                    name: "www.my-name.com",
                    bindingType: "SniEnabled",
                    certificateId:
                      "/subscriptions/34adfa4f-cedf-4dc0-ba29-b6d1a69ab345/resourceGroups/rg/providers/Microsoft.App/managedEnvironments/demokube/certificates/my-certificate-for-my-name-dot-com",
                  },
                  {
                    name: "www.my-other-name.com",
                    bindingType: "SniEnabled",
                    certificateId:
                      "/subscriptions/34adfa4f-cedf-4dc0-ba29-b6d1a69ab345/resourceGroups/rg/providers/Microsoft.App/managedEnvironments/demokube/certificates/my-certificate-for-my-other-name-dot-com",
                  }
                ],
                external: true,
                targetPort: 3000,
                traffic: [
                  {
                    label: "production",
                    revisionName: "testcontainerApp0-ab1234",
                    weight: 100
                  }
                ]
              }
            },
            location: "East US",
            managedEnvironmentId:
              "/subscriptions/34adfa4f-cedf-4dc0-ba29-b6d1a69ab345/resourceGroups/rg/providers/Microsoft.App/managedEnvironments/demokube",
            template: {
              containers: [
                {
                  name: "testcontainerApp0",
                  image: "repo/testcontainerApp0:v1",
                  probes: [
                    {
                      type: "Liveness",
                      httpGet: {
                        path: "/health",
                        httpHeaders: [{ name: "Custom-Header", value: "Awesome" }],
                        port: 8080
                      },
                      initialDelaySeconds: 3,
                      periodSeconds: 3
                    }
                  ]
                }
              ],
              scale: {
                maxReplicas: 5,
                minReplicas: 1,
                rules: [
                  {
                    name: "httpscalingrule",
                    custom: { type: "http", metadata: { concurrentRequests: "50" } }
                  }
                ]
              }
            }
          };


        core.debug("Deployment Step Started");

        //    "location": taskParams.location,
        //    "containers": [
        //        {
        //            "name": taskParams.containerName,
        //            "command": taskParams.commandLine,
        //            "environmentVariables": taskParams.environmentVariables,
        //            "image": taskParams.image,
        //            "ports": taskParams.ports,
        //            "resources": getResources(taskParams),
        //            "volumeMounts": taskParams.volumeMounts
        //        }
        //    ],
        //    "imageRegistryCredentials": taskParams.registryUsername ? [ { "server": taskParams.registryLoginServer, "username": taskParams.registryUsername, "password": taskParams.registryPassword } ] : [],
        //    "ipAddress": {
        //        "ports": getPorts(taskParams),
        //        "type": taskParams.ipAddress,
        //        "dnsNameLabel": taskParams.dnsNameLabel
        //    },
        //    "diagnostics": taskParams.diagnostics,
        //    "volumes": taskParams.volumes,
        //    "osType": taskParams.osType,
        //    "restartPolicy": taskParams.restartPolicy,
        //    "type": "Microsoft.ContainerInstance/containerGroups",
        //    "name": taskParams.containerName
        //}


        let containerAppDeploymentResult = await client.containerApps.beginCreateOrUpdate(
            taskParams.resourceGroup, 
            taskParams.containerAppName, 
            containerAppEnvelope,
            );
        
        if(containerAppDeploymentResult.getOperationState.toString() == "Succeeded") {
            console.log("Deployment Succeeded.");
            //let appUrlWithoutPort = containerAppDeploymentResult.properties.ingress.fqdn;
            //let port = taskParams.ports[0].port;
            //let appUrl = "http://"+appUrlWithoutPort+":"+port.toString()+"/"
            //core.setOutput("app-url", appUrl);
            //console.log("Your App has been deployed at: "+appUrl);
            core.debug("Deployment Result: "+containerAppDeploymentResult);
        } else {
            core.debug("Deployment Result: "+containerAppDeploymentResult);
            throw Error("Container Deployment Failed"+containerAppDeploymentResult);
        }
    }
    catch (error) {
        core.debug("Deployment Failed with Error: " + error);
        //core.setFailed(error);
    }
    finally{
        core.debug("ERRRRROOR");
        // Reset AZURE_HTTP_USER_AGENT
        //core.exportVariable('AZURE_HTTP_USER_AGENT', prefix);
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