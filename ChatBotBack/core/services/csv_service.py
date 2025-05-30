import io
import json
import re
import pandas as pd
import unicodedata
import ast

from django.http import HttpResponse
from core.models.message import Message
from core.api.serializers.message_serializers import MessageSerializer
from core.llms.gemini_llm import GeminiLLM


def normalize_str(s):
    return unicodedata.normalize("NFKD", s).encode("ASCII", "ignore").decode("utf-8")


def extract_csv_from_text(text):
    match = re.search(r"```(?:csv|json|text)?\n(.*?)```", text, re.DOTALL | re.IGNORECASE)
    if match:
        return match.group(1).strip()

    lines = text.splitlines()
    csv_lines = []
    header_found = False
    for line in lines:
        if not header_found and re.match(r"^\s*nome\s*,", line, re.IGNORECASE):
            header_found = True
        if header_found:
            if re.match(r"^\s*\|\s*", line):  
                continue
            csv_lines.append(line)
    if csv_lines:
        return "\n".join(csv_lines).strip()
    return None


def extract_data_dict_from_code(code):
    match = re.search(r"data\s*=\s*(\{.*?\})", code, re.DOTALL)
    if match:
        dict_str = match.group(1)
        try:
            return ast.literal_eval(dict_str)
        except Exception as e:
            print("Erro ao avaliar dict data:", e)
    return None


def extract_json_list_from_text(text):
    try:
        match = re.search(r"(\[\s*\{.*?\}\s*\])", text, re.DOTALL)
        if match:
            json_str = match.group(1)
            return json.loads(json_str)
    except Exception as e:
        print("Erro ao extrair lista JSON:", e)
    return None

def extract_markdown_table(text):
    pattern = re.compile(r"^\s*\|.*\|\s*$", re.MULTILINE)
    matches = pattern.findall(text)
    if matches:
        table_str = "\n".join(matches)
        try:
            df = pd.read_csv(io.StringIO(table_str), sep="|").dropna(axis=1, how="all")
            df.columns = df.columns.str.strip()
            return df
        except Exception as e:
            print("Erro ao converter tabela markdown:", e)
    return None

def process_csv_and_respond(user, file_obj, instruction):
    Message.objects.create(user=user, sender='user', text=instruction)

    df = pd.read_csv(file_obj, encoding='latin1')

    df.columns = [
        re.sub(r'\W+', '', normalize_str(col).strip().lower().replace(' ', '_'))
        for col in df.columns
    ]

    num_linhas_com_dados = df.dropna(how='all').shape[0]
    max_linhas = 10
    linhas_para_enviar = min(num_linhas_com_dados, max_linhas)

    amostra_dados = df.head(linhas_para_enviar).to_dict(orient='records')
    amostra_str = json.dumps(amostra_dados, ensure_ascii=False)

    valid_columns = ', '.join(df.columns)
    full_instruction = (
        f"Considere apenas essas colunas disponíveis: {valid_columns}.\n"
        f"Aqui está uma amostra dos dados:\n{amostra_str}\n\n"
        f"{instruction}"
    )

    llm = GeminiLLM()
    code_response = llm.call(full_instruction)
    print("Resposta da IA:\n", code_response)

    
    csv_text = extract_csv_from_text(code_response)
    if csv_text:
        csv_text = csv_text.strip()
        try:
            if csv_text.startswith('[') or csv_text.startswith('{'):
                df_result = pd.read_json(io.StringIO(csv_text))
            else:
                df_result = pd.read_csv(io.StringIO(csv_text))

            df_result = df_result.applymap(lambda x: normalize_str(str(x)) if isinstance(x, str) else x)
            output = io.StringIO()
            df_result.to_csv(output, index=False)
            Message.objects.create(user=user, sender='chatgpt', text="Resultado retornado como arquivo CSV.")
            response = HttpResponse(output.getvalue(), content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename=\"resultado.csv\"'
            return response
        except Exception as e:
            print("Erro ao ler CSV/JSON extraído da IA:", e)

    
    data_dict = extract_data_dict_from_code(code_response)
    if data_dict:
        try:
            df_result = pd.DataFrame(data_dict)
            df_result = df_result.applymap(lambda x: normalize_str(str(x)) if isinstance(x, str) else x)
            output = io.StringIO()
            df_result.to_csv(output, index=False)
            Message.objects.create(user=user, sender='chatgpt', text="Resultado retornado como DataFrame extraído do código.")
            response = HttpResponse(output.getvalue(), content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename=\"resultado.csv\"'
            return response
        except Exception as e:
            print("Erro ao criar DataFrame do dict extraído:", e)

   
    data_list = extract_json_list_from_text(code_response)
    if data_list:
        try:
            df_result = pd.DataFrame(data_list)
            df_result = df_result.applymap(lambda x: normalize_str(str(x)) if isinstance(x, str) else x)
            output = io.StringIO()
            df_result.to_csv(output, index=False)
            Message.objects.create(user=user, sender='chatgpt', text="Resultado retornado como CSV a partir de lista JSON.")
            response = HttpResponse(output.getvalue(), content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename=\"resultado.csv\"'
            return response
        except Exception as e:
            print("Erro ao criar DataFrame do JSON extraído:", e)

    df_result = extract_markdown_table(code_response)
    if df_result is not None:
        df_result = df_result.applymap(lambda x: normalize_str(str(x)) if isinstance(x, str) else x)
        output = io.StringIO()
        df_result.to_csv(output, index=False)
        Message.objects.create(user=user, sender='chatgpt', text="Resultado retornado de tabela em Markdown.")
        response = HttpResponse(output.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="resultado.csv"'
        return response
   
    try:
        local_vars = {"pd": pd}
        compile(code_response, "<string>", "exec")
        exec(code_response, {}, local_vars)
        if "result" in local_vars:
            result = local_vars["result"]["value"]
            if isinstance(result, pd.DataFrame):
                result = result.applymap(lambda x: normalize_str(str(x)) if isinstance(x, str) else x)
                output = io.StringIO()
                result.to_csv(output, index=False)
                Message.objects.create(user=user, sender='chatgpt', text="Resultado retornado como arquivo CSV.")
                response = HttpResponse(output.getvalue(), content_type='text/csv')
                response['Content-Disposition'] = 'attachment; filename=\"resultado.csv\"'
                return response

        ai_text = normalize_str(str(code_response))
        chatgpt_message = Message.objects.create(user=user, sender='chatgpt', text=ai_text)
        return MessageSerializer(chatgpt_message).data

    except SyntaxError:
        ai_text = normalize_str(str(code_response))
        chatgpt_message = Message.objects.create(user=user, sender='chatgpt', text=ai_text)
        return MessageSerializer(chatgpt_message).data

    except Exception as e:
        print("Erro ao interpretar código da IA:", e)
        ai_text = normalize_str(str(code_response))
        chatgpt_message = Message.objects.create(user=user, sender='chatgpt', text=ai_text)
        return MessageSerializer(chatgpt_message).data
