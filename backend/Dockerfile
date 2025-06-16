FROM python:3.12 AS base
WORKDIR /code
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

FROM base AS dev
WORKDIR /code
CMD ["fastapi", "dev", "app/main.py", "--host", "0.0.0.0", "--port", "80"]
EXPOSE 80