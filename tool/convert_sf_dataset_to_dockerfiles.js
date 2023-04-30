const fs = require('fs');

const content = fs.readFileSync("./data/dataset_dockerfile.pb");

function extractCodeTags(str) {
    const dockerfileRegex = /<code>(FROM|MAINTAINER|RUN|CMD|EXPOSE|ENV|ADD|COPY|ENTRYPOINT|VOLUME|USER|WORKDIR|ARG|ONBUILD|#)(.*?)<\/code>/gs;
    const codeMatches = str.match(dockerfileRegex);
    return codeMatches.map((match) => match.replace(/<\/?code>/g, ''));
}

let keywords = ["FROM", "MAINTAINER", "RUN", "CMD", "EXPOSE", "ENV", "ADD", "COPY", "ENTRYPOINT", "VOLUME", "USER", "WORKDIR", "ARG", "ONBUILD", "#"];
let extracted = extractCodeTags(content.toString());
let num = 0;
extracted.forEach(code => {
    let shouldBeFile = true;
    code = code.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "'");

    keywords.forEach(keyword => {
        if(keyword == code){
            shouldBeFile = false;
        }
    });

    if(shouldBeFile){
        fs.writeFileSync("./../data/stackoverflow/sf_docker_snippet_" + num.toString() + ".Dockerfile", code.toString());
        num = num + 1;
    }
});