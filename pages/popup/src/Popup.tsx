import '@src/Popup.css';
import { withErrorBoundary, withSuspense } from '@chrome-extension-boilerplate/shared';
import { ComponentPropsWithoutRef } from 'react';

const grabGithubComparisionListData = () => {
  const runGrab = () => {
    const parseContentText = (input: string): { text: string; skip: boolean } => {
      // console.log(input);
      const taskIdReg = new RegExp(
        `(C4C|C4CGCCOM|DEX|ALLY|CICB|NDPM|ZEN|CICLP|MYBAG|TG|XAPI|SSE|CCC|MEX)\-?(\\d+)`,
        'gi',
      );
      const hasTaskID = taskIdReg.test(input);
      let returnValue = '';
      if (hasTaskID) {
        returnValue = input.replaceAll(taskIdReg, '[$1-$2|https://jira.nike.com/browse/$1-$2]');
      } else {
        if (input.includes('Merge pull')) {
          return { text: '', skip: true };
        } else {
          if (input.includes('…')) {
            returnValue = ""
          } else {
            returnValue = input;
          }
        }
      }
      returnValue = returnValue.replaceAll(/(\r\n|\n|\r)/gm, '').replaceAll(/\( #\d+$/g, '');
      return { text: returnValue, skip: false };
    };

    const commitNodes = document.querySelectorAll('p.mb-1');
    const result = [] as string[];
    commitNodes.forEach(item => {
      const line = [];
      for (let index = 0; index < item.children.length; index++) {
        const child = item.children[index];
        const { textContent } = child;
        if (textContent) {
          const obj = parseContentText(textContent);
          if (obj.skip) {
            break;
          } else {
            line.push(obj.text);
          }
        }
      }
      const lineText = line.join('');
      if (lineText.trim().length > 0) {
        result.push(lineText);
      }
    });

    const value = result.join('\n');
    const textareaID = 'txt-clipboard';
    let textarea = document.getElementById(textareaID) as HTMLTextAreaElement;
    if (!textarea) {
      textarea = document.createElement('textarea');
      textarea.id = textareaID;
      textarea.style.opacity = '0';
      document.body.append(textarea);
    }
    textarea.value = value;
    console.info(value);
    textarea.select();
    document.execCommand('copy');
  };

  chrome.tabs.query({ active: true, currentWindow: true }, function (tab) {
    chrome.scripting.executeScript({
      target: { tabId: tab[0]?.id || 0 },
      func: runGrab,
    });
  });
};

const Popup = () => {
  const GoButton = (_: ComponentPropsWithoutRef<'button'>) => {
    const onGrab = () => {
      grabGithubComparisionListData();
    };
    return <button onClick={() => onGrab()}>Copy</button>;
  };

  return (
    <div className="app">
      <div className="flex flex-col">
        <GoButton />
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
