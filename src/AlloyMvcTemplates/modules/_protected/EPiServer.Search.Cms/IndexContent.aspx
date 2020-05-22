<%@ Page Language="C#" AutoEventWireup="false" CodeBehind="IndexContent.aspx.cs" Inherits="EPiServer.UI.Admin.IndexContent"  Title="Index Content" %>

<asp:Content ContentPlaceHolderID="MainRegion" runat="server">
    <div class="epi-contentArea epi-formArea">
        <p><%: Translate("/admin/indexcontent/latestindexing") %>
            <strong><asp:Literal runat="server" ID="IndexDate" /></strong>
        </p>
        <asp:CheckBox runat="server" Text="<%$ Resources: EPiServer, admin.indexcontent.resetindex %>" ID="ResetIndex" Checked="true" />
        <br />
        <%: Translate("/admin/indexcontent/resetinfo") %>
        <div class="epi-buttonDefault">
            <EPiServerUI:ToolButton runat="server" Text="<%$ Resources: EPiServer, admin.indexcontent.indexcontentbutton %>" OnClick="IndexContent_Click" SkinID="Refresh" />
        </div>
    </div>
</asp:Content>
