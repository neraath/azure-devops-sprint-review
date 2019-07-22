# Azure DevOps Sprint Review Extension

[![Build Status](https://dev.azure.com/ms/azure-devops-extension-sample/_apis/build/status/Microsoft.azure-devops-extension-sample)](https://dev.azure.com/ms/azure-devops-extension-sample/_build/latest?definitionId=14)

This repository contains the source code for a Sprint Review extension to help development team members review sprint commitments and keep track of key changes, like additions or removals, after the committment date. 

## Dependencies

The repository depends on a few Azure DevOps packages:

- [azure-devops-extension-sdk](https://github.com/Microsoft/azure-devops-extension-sdk): Required module for Azure DevOps extensions which allows communication between the host page and the extension iframe.
- [azure-devops-extension-api](https://github.com/Microsoft/azure-devops-extension-api): Contains REST client libraries for the various Azure DevOps feature areas.
- [azure-devops-ui](https://developer.microsoft.com/azure-devops): UI library containing the React components used in the Azure DevOps web UI.

Some external dependencies:
- `React` - Is used to render the UI in the samples, and is a dependency of `azure-devops-ui`.
- `TypeScript` - Samples are written in TypeScript and complied to JavaScript
- `SASS` - Extension samples are styled using SASS (which is compiled to CSS and delivered in webpack js bundles).
- `webpack` - Is used to gather dependencies into a single javascript bundle for each sample.

## Building the project

Just run:

    npm run build

This produces a .vsix file which can be uploaded to the [Visual Studio Marketplace](https://marketplace.visualstudio.com/azuredevops)

## Using the extension

The preferred way to get started is to use the `tfx extension init` command which will clone from this sample and prompt you for replacement information (like your publisher id). Just run:

    npm install -g tfx-cli
    tfx extension init

You can also clone the sample project and change the `publisher` property in `azure-devops-extension.json` to your own Marketplace publisher id. Refer to the online [documentation](https://docs.microsoft.com/en-us/azure/devops/extend/publish/overview?view=vsts) for setting up your own publisher and publishing an extension.