# Episerver Labs - Block Enhancements

The project contains a few features that, in general, make the life of Episerver editors easier.
The vision is to make it possible to edit and publish blocks directly on the page without a need for switching context. 
The page is selected at all times and all actions around local blocks is performed inline.

The list of current features is as following:
* [Publish content with local blocks](#publish-content-with-local-blocks)<br>
* [Inline block editing](#inline-block-editing)<br>
* [Showing block status on content area](#showing-block-status-on-content-area)<br>
* [Inline publishing](#inline-publish)<br>
* [Content Draft View](#content-draft-view)<br>

All of those features work together, but you can decide which ones are enabled, by [Configuring enabled features](#configuring-enabled-features)<br>

## Publish content with local blocks

This is an extra command available in the global menu. It automatically checks the "For this page" folder of the current page and lists all draft versions of blocks that could be published with the page.

![Publish content with local blocks](assets/docsimages/publish_with_local_items.png)

After running the command, a dialog box with a list of all draft versions of local blocks is displayed. 
The editor can decide which blocks will be published using checkboxes next to the local block name.

![Publish content with local blocks](assets/docsimages/publish_with_local_items_dialog.png)

The command will publish the page and all selected blocks.

Known issue |
------------ |
If a block contains a "For this block" folder, the content from this block will not be published. |

Using this feature, the editor do not have to manually click through all local blocks just to check if all of them have already been published.

![Publish content with local blocks](assets/docsimages/publish_with_local_items_demo.gif)

## Inline block editing

This feature allows editors to edit block content directly on the page. 

There is new **"Inline block edit"** command added to content area items menu.

![Inline block editing command](assets/docsimages/inline_edit.png)

The command opens a dialog box with an editable block form. 
The editor can edit blocks the same way as when switching to blocks editing context.

![Inline block editing default form](assets/docsimages/inline_edit_advanced_block.png)

As you can see, the layout is a bit different than in the Forms view. Tabs are replaced with sections which makes more sense for blocks that usually have only a few properties.

The changes can also be published directly from the dialog box.

Additionally, the command is available from the assets pane.

![Inline block editing from assets](assets/docsimages/inline_edit_from_blocks_component.png)

In many scenarios, blocks are not using `Name` and `Categories` properties during rendering.
This is the reason why we introduced the `InlineBlockEditSettings` configuration attribute.
You can apply it to your block content type and hide those properties. 
Additionally, you can also use this attribute to hide specific groups to make the editing form cleaner.

The attribute contains three properties:

Property | Default value | Description
------------ | ------------- | ------------- 
ShowNameProperty | false | When `true`, then `Name` property will be displayed
ShowCategoryProperty | false | When `true`, then `Categories` property will be displayed
HiddenGroups | Advanced | Comma-separated list of tabs that should be hidden

For example, the only property that is editable for the Editorial block type in the Alloy templates is "Main body".
There is no need to display other built-in properties or group properties into sections:

![Inline block editing with publish and tinymce](assets/docsimages/inline_edit_Editorial_block.png)

Another example is the Teaser block which has just a few simple properties: 

![Inline block editing enhanced form](assets/docsimages/inline_edit_dialog.png)

To turn on `Name` property:

```csharp
[SiteContentType(GUID = "67F617A4-2175-4360-975E-75EDF2B924A7",
    GroupName = SystemTabNames.Content)]
[SiteImageUrl]
[InlineBlockEditSettings(ShowNameProperty = true)]
public class EditorialBlock : SiteBlockData
{
    [Display(GroupName = SystemTabNames.Content)]
    [CultureSpecific]
    public virtual XhtmlString MainBody { get; set; }
}
```

And below how to display `Name` and `Categories` properties and `Settings` group.

```csharp
[SiteContentType(GUID = "9E7F6DF5-A963-40C4-8683-211C4FA48AE1")]
[SiteImageUrl]
[InlineBlockEditSettings(ShowNameProperty = true, ShowCategoryProperty = true, HiddenGroups = "")]
public class AdvancedBlock : SiteBlockData
{
    [Display(Order = 1, GroupName = SystemTabNames.Content)]
    public virtual string Text1 { get; set; }

    [Display(Order = 2, GroupName = SystemTabNames.Content)]
    public virtual string Text2 { get; set; }

    [Display(Order = 1, GroupName = Global.GroupNames.Products)]
    public virtual string Text3 { get; set; }

    [Display(Order = 2, GroupName = Global.GroupNames.Products)]
    public virtual string Text4 { get; set; }
}
```

![Inline blocks edit](assets/docsimages/inline_edit_demo.gif)

## Showing block status on content area

Another enhancement is the way to get a bit more details about particular content area items.
Each content area item will display status icons similar to the page tree. You will now see if block is a draft or if a language branch is missing.

Additionally to help distinguish local blocks from shared blocks, there is a new "Local block" icon.  

![Publish content with local blocks](assets/docsimages/contentarea_statuses.png)

Thanks to those flags, the editor can easily see if the page is ready to be published or not.

## Inline publish

This feature is just a convenient way to publish Content Area Items directly from the list, without the need of switching context.

There is a new command available in the content area menu.

![Publish content with local blocks](assets/docsimages/inline_publish.png)

And also from the assets pane.

![Publish content with local blocks](assets/docsimages/inline_publish_from_blocks_component.png)

![Publish content with local blocks](assets/docsimages/inline_publish_demo.gif)

## Content Draft View

Allow editors to preview draft versions of content area blocks.

There is now a new button in the top bar.

![Toggle draft view](assets/docsimages/content_draft_view.png)

By default in edit view, the editor sees the published blocks versions when a page is rendered.

![Published content view](assets/docsimages/content_draft_view_published_content.png)

The editor can use the new **"Content Draft View"** button to get an overview of how the page will look after all blocks have been published.

![Unpublished content view](assets/docsimages/content_draft_view_unpublished_content.png)

![Content draft view](assets/docsimages/content_draft_view_demo.gif)

## Configuring enabled features

To turn off one or more feature, use the `BlockEnhancementsOptions` options class and then, for example, in the initialization module, set `false` on the feature that should not be available. All features are enabled by default. 
 
```csharp
[InitializableModule]
public class CustomBlockEnhancementsModule : IInitializableHttpModule
{
    public void Initialize(InitializationEngine context)
    {
        var options = ServiceLocator.Current.GetInstance<BlockEnhancementsOptions>();
        options.InlineEditing = false;
        options.PublishWithLocalContentItems = true;
        options.ContentDraftView = true;
        options.InlinePublish = false;
        options.StatusIndicator = false;
    }

    public void Uninitialize(InitializationEngine context)  {  }

    public void InitializeHttpEvents(HttpApplication application) {  }
}
 ```
 


### Please note
> Episerver Labs projects are meant to provide the developer community with pre-release features with the purpose of showcasing ongoing work and getting feedback in early stages of development. 
>
> You should be aware that Labs are trials and not supported Episerver releases. While we hope you use them there are a few things you should expect:
> *	Functionality may change 
> *	Labs projects  have not been through the same quality assurance process as the versioned products and in some cases may show unexpected behaviour.
> *	The software may not work on all environments
> *	There is promise of support , however we will gratefully receive all feedback
>
> The software is provided “As is” without warranty of any kind or promise of support.
In no event shall Episerver be liable for any claim, damages or liability in relation to the software
By using this software you are also agreeing to our developer program terms [https://www.episerver.com/legal/program-terms/](https://www.episerver.com/legal/program-terms/)
