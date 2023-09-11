export function parseResultToList(inputString) {
    const lines = inputString.split('\n');
    const result = [];
    let currentBlock = null;

    for (const line of lines) {
        if (line.startsWith('```')) {
            const codeTypeMatch = line.match(/^```(\w+)/);
            if (codeTypeMatch) {
                const codeType = codeTypeMatch[1];
                currentBlock = {
                    isText: false,
                    codeType: codeType,
                    txt: ''
                };
            } else {
                if (currentBlock) {
                    result.push(currentBlock);
                    currentBlock = null;
                }
            }
        } else {
            if (currentBlock) {
                currentBlock.txt += line + '\n';
            } else {
                if (result.length > 0 && result[result.length - 1].isText) {
                    result[result.length - 1].txt += line + '\n';
                } else {
                    result.push({
                        isText: true,
                        codeType: null,
                        txt: line
                    });
                }
            }
        }
    }

    return result;
}