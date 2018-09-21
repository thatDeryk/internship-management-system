import { OnlineInternshipMsFrontendPage } from './app.po';

describe('online-internship-ms-frontend App', () => {
  let page: OnlineInternshipMsFrontendPage;

  beforeEach(() => {
    page = new OnlineInternshipMsFrontendPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
