# Linkshortener
This application allows to create shortened Links with your own Domain.
You manage your links in a SharePoint Online List where your destination Links can be changed at any time.
Add /qr to your links and you will get an customized QR Code to your Link.

## Requirements
The App is running as an NodeJS Application where could be running whereever you want. For example in Azure Container Instances as in my case.
For that you will need an Azure Subscription and an Azure Container Registry deployed in it.
You will need an active Microsoft Tenant with the possibility to create a Lists in SharePoint.

## ACI Deployment
In the deployment Folder you find an deploy.azcli script which helps you to deploy the Application with Azure Container Instances.
The deploy-aci.yaml helds the configuration for the containers in the ACI. It has additionally an Caddy sidecar which handles the SSL Certificat Management.

Don't forget to set the environment variables, they are mandatory, except the ones to customize your QR Code.
