import axios, {AxiosError, AxiosResponse} from 'axios';
import fs from 'fs';
import path from 'path';

import {isAllowedPath} from './fileUtil';

export const fetchUrls = async (
  inputUrls: string[],
  cookies: {[domain: string]: string[]},
): Promise<{files: Buffer[]; urls: string[]}> => {
  const files: Buffer[] = [];
  const urls: string[] = [];

  await Promise.all(
    inputUrls.map(async (url) => {
      if (url.startsWith('http:') || url.startsWith('https:')) {
        const domain = url.split('/')[2];

        const file = await axios({
          method: 'GET',
          url,
          responseType: 'arraybuffer',
          headers: cookies?.[domain]
            ? {
                Cookie: cookies[domain].join('; ').concat(';'),
              }
            : undefined,
        }).then(
          (res: AxiosResponse) => res.data,
          (e: AxiosError) => console.error(e),
        );

        if (file instanceof Buffer) {
          files.push(file);
        }

        return;
      }

      if (fs.existsSync(url) && isAllowedPath(path.resolve(url))) {
        try {
          files.push(fs.readFileSync(url));
          return;
        } catch {
          // do nothing.
        }
      }

      urls.push(url);
    }),
  );

  return {files, urls};
};
