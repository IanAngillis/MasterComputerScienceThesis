const fs = require('fs');

const content = fs.readFileSync("./data/dataset_dockerfile.pb");

function extractCodeTags(str) {
    const dockerfileRegex = /<code>(FROM|MAINTAINER|RUN|CMD|EXPOSE|ENV|ADD|COPY|ENTRYPOINT|VOLUME|USER|WORKDIR|ARG|ONBUILD)(.*?)<\/code>/gs;
    const codeMatches = str.match(dockerfileRegex);
    return codeMatches.map((match) => match.replace(/<\/?code>/g, ''));
}

// Example usage
extractCodeTags(content.toString()).forEach(l => {
    console.log("**");
    console.log(l);
    console.log("**");
})
