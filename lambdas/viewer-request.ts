import { CloudFrontRequestHandler } from "aws-lambda";

export const handler: CloudFrontRequestHandler = (event, _, callback) => {
  const request = event.Records[0].cf.request;
  const olduri = request.uri;
  const redirect = (newUri: string) => {
    const response = {
      status: "301",
      statusDescription: "Moved Permanently",
      headers: {
        location: [
          {
            key: "Location",
            value: `https://roamjs.com${newUri}`,
          },
        ],
      },
    };
    return callback(null, response);
  }
  if (/^\/docs(\/extensions)?/.test(olduri)) {
    const newUri = olduri.replace(/^\/docs(\/extensions)?/, "/extensions");
    return redirect(newUri);
  } else if (/^\/services\/social(\/)?/.test(olduri)) {
    const newUri = '/extensions/twitter';
    return redirect(newUri);
  } else if (/^\/services(.*)$/.test(olduri)) {
    const newUri = olduri.replace(/^\/services(.*)$/, "/extensions$1");
    return redirect(newUri);
  }
  return callback(null, request);
};
