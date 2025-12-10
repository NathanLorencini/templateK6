Rodar o conteudo de envs no packjson direto no terminal antes de qualquer coisa
for /f "usebackq tokens=1,* delims== " %a in (.env) do @set "%a=%b