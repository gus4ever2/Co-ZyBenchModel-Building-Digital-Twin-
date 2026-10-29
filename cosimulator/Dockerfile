# syntax=docker/dockerfile:1.7

# EnergyPlus 26.1 ships for Ubuntu 24.04; keep that runtime so its native
# libraries match the official build.
FROM ubuntu:24.04

ARG DEBIAN_FRONTEND=noninteractive
ARG ENERGYPLUS_VERSION=26.1.0
ARG ENERGYPLUS_SHA256=b651f4197bfc147a0f66dc92c58895d1748bdadb7a0288145fa9d50375edfbca
ARG ENERGYPLUS_ARCHIVE=EnergyPlus-26.1.0-6f2e40d102-Linux-Ubuntu24.04-x86_64

ENV ENERGYPLUS_HOME=/opt/${ENERGYPLUS_ARCHIVE} \
    R_HOME=/usr/lib/R \
    R_LIBS_USER=/app/data/r-library \
    MAMBA_ROOT_PREFIX=/opt/micromamba \
    COSIMULATOR_HOST=0.0.0.0 \
    COSIMULATOR_PORT=5000 \
    COSIMULATOR_MONGO_URI=mongodb://mongo:27017/ \
    COSIMULATOR_MONGO_DATABASE=cozybench \
    PATH=/opt/cosimulator-env/bin:/usr/local/bin:$PATH

# Install native requirements for R, rpy2 and EnergyPlus, plus the
# self-contained micromamba binary used to install CARIBU for Python 3.11.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        bzip2 ca-certificates curl gnupg gfortran libcurl4-openssl-dev \
        libexpat1 libgomp1 libssl-dev libxml2-dev libx11-6 tar \
    && install -d -m 0755 /etc/apt/keyrings \
    && curl --fail --location --silent --show-error \
        https://cloud.r-project.org/bin/linux/ubuntu/marutter_pubkey.asc \
        --output /tmp/cran-r-project.asc \
    && gpg --show-keys --with-colons /tmp/cran-r-project.asc \
        | grep -q 'E298A3A825C0D65DFD57CBB651716619E084DAB9' \
    && gpg --dearmor --output /etc/apt/keyrings/cran-r-project.gpg \
        /tmp/cran-r-project.asc \
    && chmod 0644 /etc/apt/keyrings/cran-r-project.gpg \
    && echo 'deb [signed-by=/etc/apt/keyrings/cran-r-project.gpg] https://cloud.r-project.org/bin/linux/ubuntu noble-cran40/' \
        > /etc/apt/sources.list.d/cran-r-project.list \
    && rm /tmp/cran-r-project.asc \
    && apt-get update \
    && apt-get install -y --no-install-recommends r-base r-base-dev \
    && rm -rf /var/lib/apt/lists/* \
    && curl -Ls https://micro.mamba.pm/api/micromamba/linux-64/latest \
       | tar -xvj -C /usr/local/bin bin/micromamba \
    && chmod +x /usr/local/bin/bin/micromamba \
    && ln -s /usr/local/bin/bin/micromamba /usr/local/bin/micromamba

# CARIBU is installed from OpenAlea's conda channel. The remaining Python
# project dependencies are installed from pyproject.toml into the same env.
RUN micromamba create --yes --prefix /opt/cosimulator-env \
        --channel openalea3 --channel conda-forge \
        python=3.11 openalea.caribu pip \
    && micromamba clean --all --yes

# Install the EnergyPlus version required by the IDF code and verify the
# official release archive using its published SHA-256 checksum.
RUN curl --fail --location --silent --show-error \
        "https://github.com/NatLabRockies/EnergyPlus/releases/download/v${ENERGYPLUS_VERSION}/${ENERGYPLUS_ARCHIVE}.tar.gz" \
        --output /tmp/energyplus.tar.gz \
    && echo "${ENERGYPLUS_SHA256}  /tmp/energyplus.tar.gz" | sha256sum --check --status \
    && mkdir -p /opt \
    && tar -xzf /tmp/energyplus.tar.gz -C /opt \
    && rm /tmp/energyplus.tar.gz \
    && test -f "${ENERGYPLUS_HOME}/Energy+.idd"

WORKDIR /app

# Install plantecophys into the project-local R library path used at runtime.
RUN mkdir -p /app/data/r-library /app/data/workspace /app/data/output /app/logs \
    && Rscript -e 'install.packages("plantecophys", lib=Sys.getenv("R_LIBS_USER"), repos="https://cloud.r-project.org")'

COPY pyproject.toml ./
COPY src ./src
COPY data/input ./data/input
COPY data/weather ./data/weather

RUN python -m pip install --no-cache-dir . \
    && python -c 'import rpy2.robjects as ro; print(ro.r("R.version.string")[0])' \
    && Rscript -e 'library(plantecophys)'

# The application writes only under these project data directories.
RUN useradd --create-home --uid 10001 cosimulator \
    && chown -R cosimulator:cosimulator /app/data /app/logs

USER cosimulator

EXPOSE 5000

CMD ["uvicorn", "cosimulator.main:app", "--host", "0.0.0.0", "--port", "5000"]
