# Namespace of the assemblyBinding element
$ns = "urn:schemas-microsoft-com:asm.v1"

##
## Updates the assemblyBinding element of the config to contain binding redirects to the files in installPath
##
Function Update-AssemblyBinding([System.Xml.XmlDocument]$config, $installPath)
{
	$assemblyBindingElement = Get-AssemblyBindingElement $config

	$assemblyConfigs = $assemblyBindingElement.ChildNodes | where {$_.GetType().Name -eq "XmlElement"}

	#add/update binding redirects for assemblies in the current package
	$libPath = join-path $installPath "lib\net461"
	get-childItem "$libPath\*.dll" | % { Update-BindingRedirect $_  $assemblyConfigs $config }

    return $config
}

##
## Gets the assembly binding elements, and if there are multiple, merges them to one.
##
Function Get-AssemblyBindingElement([System.Xml.XmlDocument]$config)
{
	# assume that we have the configuration element and make sure we have all the other parents of the AssemblyIdentity element.
	$configElement = $config.configuration
	$runtimeElement = Get-Element $configElement "runtime" $null $config
	$assemblyBindingElement = Get-Element $runtimeElement "assemblyBinding" $ns $config

	if ($assemblyBindingElement.length -gt 1)
	{
		for ($i=1; $i -lt $assemblyBindingElement.length; $i++)
		{
			$assemblyBindingElement[0].InnerXml +=  $assemblyBindingElement[$i].InnerXml
			$runtimeElement.RemoveChild($assemblyBindingElement[$i]) | Out-Null
		}
	}
	else
	{
		$assemblyBindingElement = @($assemblyBindingElement)
	}

	$assemblyBindingElement[0]
}

##
## Inserts a new or updates an existing dependentAssembly element for a specified assembly
##
Function Update-BindingRedirect([System.IO.FileInfo] $file, [System.Xml.XmlElement[]] $assemblyConfigs, [System.Xml.XmlDocument] $config)
{
	[regex]$regex = '[\w\.]+,\sVersion=[\d\.]+,\sCulture=(?<culture>[\w-]+),\sPublicKeyToken=(?<publicKeyToken>\w+)'
    $name =  Get-FileName $file
    $assemblyName = Get-AssemblyName $file

    $assemblyConfig =  $assemblyConfigs | ? { $_.assemblyIdentity.Name -Eq $name }

    if ($assemblyConfig -Eq $null)
    {
        #there is no existing binding configuration for the assembly, we need to create a new config element for it
        Write-Host "Adding binding redirect for $name".

        $matches = $regex.Matches($assemblyName.FullName)
        if ($matches.Count -gt 0)
        {
	        $publicKeyToken = $matches[0].Groups["publicKeyToken"].Value
	        $culture = $matches[0].Groups["culture"].Value
        }
        else
        {
            Write-Host "Unable to figure out culture and publicKeyToken for $name"
	        $publicKeyToken = "null"
	        $culture = "neutral"
        }

        $assemblyIdentity = $config.CreateElement("assemblyIdentity", $ns)
        $assemblyIdentity.SetAttribute("name", $name)
        if (![String]::IsNullOrEmpty($publicKeyToken))
        {
	        $assemblyIdentity.SetAttribute("publicKeyToken", $publicKeyToken)
        }
        if (![String]::IsNullOrEmpty($culture))
        {
	        $assemblyIdentity.SetAttribute("culture", $culture)
        }

        $bindingRedirect = $config.CreateElement("bindingRedirect", $ns)
        $bindingRedirect.SetAttribute("oldVersion", "")
        $bindingRedirect.SetAttribute("newVersion", "")

        $assemblyConfig = $config.CreateElement("dependentAssembly", $ns)
        $assemblyConfig.AppendChild($assemblyIdentity) | Out-Null
        $assemblyConfig.AppendChild($bindingRedirect) | Out-Null

        #locate the assemblyBinding element and append the newly created dependentAssembly element
        $assemblyBinding = $config.configuration.runtime.ChildNodes | where {$_.Name -eq "assemblyBinding"}
        $assemblyBinding.AppendChild($assemblyConfig) | Out-Null
    }
    else
    {
        Write-Host "Updating binding redirect for $name"
    }

    $assemblyConfig.bindingRedirect.oldVersion = "0.0.0.0-" + $assemblyName.Version
    $assemblyConfig.bindingRedirect.newVersion = $assemblyName.Version.ToString()
}

#
# Gets an existing element or creates it
#
Function Get-Element([System.Xml.XmlElement]$parent, $elementName, $ns, $document)
{
    $child = $parent.$($elementName)
    if ($child -eq $null)
    {
        $child = $document.CreateElement($elementName, $ns)
        $parent.AppendChild($child) | Out-Null
    }
    $child
}

##
## Gets the file name from given FileInfo obj
##
Function Get-FileName([System.IO.FileInfo] $file)
{
   $name = [System.IO.Path]::GetFileNameWithoutExtension($file)
   return $name
}

##
## Gets the Assembly name object from given FileInfo obj
##
Function Get-AssemblyName([System.IO.FileInfo] $file)
{
  $assemblyName = [System.Reflection.AssemblyName]::GetAssemblyName($file)
  return $assemblyName
}
