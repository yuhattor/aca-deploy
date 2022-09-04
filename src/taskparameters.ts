import * as core from '@actions/core';
import fs = require('fs');
  
export class TaskParameters {
    private static taskparams: TaskParameters;

    // Required basic parameters
    private _resourceGroup: string;
    private _containerAppName: string;
    private _location: string; 
    private _subscriptionId: string;
    private _managedEnvironmentName: string;

    // Optional Dapr parameters
    private _daprEnabled: boolean;
    private _daprAppPort: number;
    private _daprAppProtocol: string;

    // Optional Ingress parameters
    private _ingressExternal: boolean;
    private _ingressTargetPort: number;
    private _ingressCustomDomains: any[]; 
    private _ingressTraffic: any[];

    // Optional scale parameters
    private _scaleMaxReplicas: number;
    private _scaleMinReplicas: number;

    private constructor() {

        // Required basic parameters
        this._subscriptionId = core.getInput('subscription-id',{ required: true } );
        this._resourceGroup = core.getInput('resource-group', { required: true });
        this._containerAppName = core.getInput('name', { required: true });
        this._location = core.getInput('location', { required: true });
        this._managedEnvironmentName = core.getInput('managed-environment-name', { required: true })

        // Optional Dapr parameters
        this._daprAppPort = parseInt(core.getInput('dapr-app-port', { required: false }));
        this._daprAppProtocol = core.getInput('dapr-app-protocol', { required: false });
        this._daprEnabled = core.getInput('dapr-enabled', { required: false }) == "true";

        // Optional ingress parameters
        this._ingressExternal = core.getInput('ingress-external', { required: false }) == "true";
        this._ingressTargetPort = parseInt(core.getInput('ingress-target-port', { required: false }));
        this._ingressCustomDomains = core.getInput('ingress-custom-domains', { required: false }).split(',');
        this._ingressTraffic = core.getInput('ingress-traffic', { required: false }).split(',');

        // Optional scale parameters
        this._scaleMaxReplicas = parseInt(core.getInput('scale-max-replicas', { required: false }));
        this._scaleMinReplicas = parseInt(core.getInput('scale-min-replicas', { required: false }));
    }

    public static getTaskParams() {
        if(!this.taskparams) {
            this.taskparams = new TaskParameters();
        }
        return this.taskparams;
    }

    // Required basic parameters
    public get resourceGroup() {
        return this._resourceGroup;
    }

    public get containerAppName() {
        return this._containerAppName;
    }

    public get location() {
        return this._location;
    }

    public get subscriptionId() {
        return this._subscriptionId;
    }

    public get managedEnvironmentName() {
        return this._managedEnvironmentName;
    }

    // Optional Dapr parameters
    public get daprAppPort() {
        return this._daprAppPort;
    }
    
    public get daprAppProtocol() {
        return this._daprAppProtocol;
    }

    public get daprEnabled() {
        return this._daprEnabled;
    }

    // Optional Ingress parameters
    public get ingressExternal(){
        return this._ingressExternal;
    }

    public get ingressTargetPort(){
        return this._ingressTargetPort;
    }

    public get ingressTraffic(){
        return this._ingressTraffic;
    }

    public get ingressCustomDomains(){
       return this._ingressCustomDomains;
    }

    // Optional scale parameters
    public get scaleMaxReplicas(){
        return this._scaleMaxReplicas;
    }

    public get scaleMinReplicas(){
        return this._scaleMinReplicas;
    }
}