# Preliminaries
This thesis was created under the supervision of Prof. Dr. Coen De Roover, Dr. Ahmed Zerouali and Ruben Opdebeeck. This thesis was submitted in partial fullfilment of the requirements for the degree of de ingenieurswetenschappen: Computerwetenschappen at the Vrije Universiteit Brussel, September 2023.

# FOLLOW YOUR NOSE - Consolidating and detecting Dockerfile smells with a focus on bloaters and layer optimization

# Abstract
Writing good Dockerfiles is a non-trivial task. As Docker is the industry standard in terms of
containerization technology, there is an increasing need for automated tools to detect quality
issues with Dockerfiles. These quality issues, or smells, impact the quality on various dimensions
such as build time, size, maintainability and security. Moreover, these smells are scattered
throughout the literature. Existing empirical research on these Dockerfile smells has only taken
a subset of these smells into consideration, painting an incomplete image of the prevalence of
these smells. We created a precise, extendable heuristic/rule-based tool with a focus on package
managers, bloaters and layer-optimisation smells and manually verified its precision using a
sample of 444 Dockerfiles. Using this tool, we analysed a dataset of more than 320,000 Dockerfiles
found on GitHub and also did this for a novel dataset comprised of more than 24,000 Dockerfiles
from Stack Overflow. We found in both datasets that layer optimization smells are prevalent,
up to 54% of the files in which they can occur. We also found that some of the previously
understudied smells are prevalent in up to 27% of the aforementioned datasets. In addition, we
found that there is much overlap in the prevalent smells for both datasets, with nine out of ten
smells making up the top ten of both datasets. Lastly, we create the first catalogue on Dockerfile
smells which consolidates 95 Dockerfile smells under four categories: maintenance, bloaters,
security and layer optimization. As such, we recommend researchers and software practitioners
to use both the catalogue and the tool to aid in the act of writing good Dockerfiles and future
research on Dockerfile quality.

# Contributions
* First Dockerfile smell catalogue comprised of 95 smells
* Extendable tool for general smells, bloaters and layer optimization smells
* Novel dataset of Dockerfiles mined from Stack Overflow
* More complete image of smell prevalence in both GitHub and Stack Overflow ecosystem.