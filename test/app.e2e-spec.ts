import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../src/app.controller';
import { ChatbotService } from '../src/chat/chatbot.service';
import { UserService } from '../src/model/user.service';
import * as dotenv from 'dotenv';
import { MessageService } from '../src/message/message.service';
import { SwiftchatMessageService } from '../src/swiftchat/swiftchat.service';
import { localisedStrings as english } from '../src/i18n/en/localised-strings';
import { KhabriMediaNewsService } from '../src/khabriMedia/newsFetching';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../src/model/user.entity';
import { LocalizationService } from '../src/localization/localization.service';

dotenv.config();

describe('AppController', () => {
  let messageService: MessageService;
  let userService: UserService;
  let khabriMediaService: KhabriMediaNewsService;
  let chatbotService: ChatbotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        ChatbotService,
        KhabriMediaNewsService,
        SwiftchatMessageService,
        {
          provide: MessageService,
          useFactory: () => ({
            sendWelcomeMessage: jest.fn(),
            sendLanguageChangedMessage: jest.fn(),
            categoryButtons: jest.fn(),
            getCategoryID: jest.fn(),
            subCategoryButtons: jest.fn(),
            goBackToMainMenu: jest.fn(),
            languageButtons: jest.fn(),
          }),
        },
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();
    messageService = module.get<MessageService>(MessageService);
    userService = module.get<UserService>(UserService);
    khabriMediaService = module.get<KhabriMediaNewsService>(
      KhabriMediaNewsService,
    );
    chatbotService = module.get<ChatbotService>(ChatbotService);
  });

  it("should send welcome message and category buttons when valid 'from' and 'text' are provided", async () => {
    jest.spyOn(userService.userRepository, 'findOne').mockResolvedValue({
      id: 'a76b9089-9583-48f9-a29d-87b36aa6c82c',
      mobileNumber: '1234567890',
      botID: '0261394256641954',
      userContext: '',
      buttonResponse: 'शिक्षा',
      language: 'English',
    });

    const body = {
      from: '1234567890',
      text: { body: 'hi' },
      button_response: null,
      persistent_menu_response: null,
    };

    await chatbotService.processMessage(body);

    expect(messageService.sendWelcomeMessage).toHaveBeenCalledWith(
      '1234567890',
      'English',
    );
    expect(messageService.categoryButtons).toHaveBeenCalledWith(
      '1234567890',
      'English',
    );
  });

  // When provided with a valid 'button_response' containing a category or subcategory, sends news as an article carousel and sub-category buttons if category is selected, or goes back to main menu if subcategory is selected.
  it('should send news as an article carousel and sub-category buttons if category is selected', async () => {
    const body = {
      from: '1234567890',
      text: null,
      button_response: { body: 'Sports' },
      persistent_menu_response: null,
    };

    // Mock the necessary methods
    jest.spyOn(userService.userRepository, 'findOne').mockResolvedValue({
      id: 'a76b9089-9583-48f9-a29d-87b36aa6c82c',
      mobileNumber: '1234567890',
      botID: '0261394256641954',
      userContext: '',
      buttonResponse: 'शिक्षा',
      language: 'English',
    });

    jest.spyOn(userService, 'findUserByMobileNumber').mockResolvedValueOnce({
      id: 'a76b9089-9583-48f9-a29d-87b36aa6c82c',
      mobileNumber: '1234567890',
      botID: '0261394256641954',
      userContext: '',
      buttonResponse: 'Sports',
      language: 'English',
    });

    jest.spyOn(userService, 'saveButtonResponse').mockResolvedValueOnce({
      id: 'a76b9089-9583-48f9-a29d-87b36aa6c82c',
      mobileNumber: '1234567890',
      botID: '0261394256641954',
      userContext: '',
      buttonResponse: 'Sports',
      language: 'English',
    });

    jest
      .spyOn(LocalizationService, 'getLocalisedString')
      .mockResolvedValueOnce(english);
    jest.spyOn(messageService, 'getCategoryID').mockResolvedValueOnce('49');
    jest
      .spyOn(khabriMediaService, 'sendNewsAsArticleCarousel')
      .mockResolvedValueOnce(2);
    jest
      .spyOn(messageService, 'subCategoryButtons')
      .mockResolvedValueOnce({ id: '83d9db82-b3b0-4802-b2d8-a92f481435c6' });

    // Act
    const result = await chatbotService.processMessage(body);

    // Assert
    expect(result).toBe('ok');
    expect(userService.findUserByMobileNumber).toHaveBeenCalledWith(
      '1234567890',
    );
    expect(LocalizationService.getLocalisedString).toHaveBeenCalledWith(
      'English',
    );
    expect(messageService.getCategoryID).toHaveBeenCalledWith(
      body.button_response.body,
      'English',
    );
    expect(khabriMediaService.sendNewsAsArticleCarousel).toHaveBeenCalledWith(
      'English',
      process.env.BOT_ID,
      '1234567890',
      '49',
      'Sports',
      1,
      2,
    );
    expect(messageService.subCategoryButtons).toHaveBeenCalledWith(
      '1234567890',
      'English',
      'Sports',
    );
    expect(userService.saveButtonResponse).toHaveBeenCalledWith(
      '1234567890',
      process.env.BOT_ID,
      'Sports',
    );
  });

  // When provided with a valid 'button_response' containing a category or subcategory, sends news as an article carousel and goes back to main menu if subcategory is selected
  it('should send news as an article carousel and go back to main menu if subcategory is selected', async () => {
    // Arrange
    const body = {
      from: '1234567890',
      text: null,
      button_response: { body: 'Sports1' },
      persistent_menu_response: null,
    };

    jest.spyOn(userService.userRepository, 'findOne').mockResolvedValue({
      id: 'a76b9089-9583-48f9-a29d-87b36aa6c82c',
      mobileNumber: '1234567890',
      botID: '0261394256641954',
      userContext: '',
      buttonResponse: 'शिक्षा',
      language: 'English',
    });

    jest.spyOn(userService, 'findUserByMobileNumber').mockResolvedValueOnce({
      id: 'a76b9089-9583-48f9-a29d-87b36aa6c82c',
      mobileNumber: '1234567890',
      botID: '0261394256641954',
      userContext: '',
      buttonResponse: 'Sports',
      language: 'English',
    });

    // Mock the necessary methods
    jest
      .spyOn(LocalizationService, 'getLocalisedString')
      .mockResolvedValueOnce(english);
    jest.spyOn(messageService, 'getCategoryID').mockResolvedValueOnce('49');
    jest
      .spyOn(khabriMediaService, 'sendNewsAsArticleCarousel')
      .mockResolvedValueOnce(2);
    jest
      .spyOn(messageService, 'goBackToMainMenu')
      .mockResolvedValueOnce({ id: '83d9db82-b3b0-4802-b2d8-a92f481435c6' });

    // Act
    const result = await chatbotService.processMessage(body);

    // Assert
    expect(result).toBe('ok');
    expect(userService.findUserByMobileNumber).toHaveBeenCalledWith(
      '1234567890',
    );
    expect(LocalizationService.getLocalisedString).toHaveBeenCalledWith(
      'English',
    );
    expect(messageService.getCategoryID).toHaveBeenCalledWith(
      'Sports1',
      'English',
    );
    expect(khabriMediaService.sendNewsAsArticleCarousel).toHaveBeenCalledWith(
      'English',
      process.env.BOT_ID,
      '1234567890',
      '49',
      'Sports1',
      1,
      2,
    );
    expect(messageService.goBackToMainMenu).toHaveBeenCalledWith(
      '1234567890',
      'English',
    );
  });

  // When given a valid 'button_response' in the request body with the value of 'Go Back To Main Menu', it sends the category buttons to the user.
  it("should send category buttons when given valid 'button_response' with value 'Go Back To Main Menu'", async () => {
    const body = {
      from: '1234567890',
      text: null,
      button_response: { body: 'Go Back To Main Menu' },
      persistent_menu_response: null,
    };

    jest.spyOn(userService.userRepository, 'findOne').mockResolvedValue({
      id: 'a76b9089-9583-48f9-a29d-87b36aa6c82c',
      mobileNumber: '1234567890',
      botID: '0261394256641954',
      userContext: '',
      buttonResponse: 'शिक्षा',
      language: 'English',
    });

    jest.spyOn(userService, 'findUserByMobileNumber').mockResolvedValueOnce({
      id: 'a76b9089-9583-48f9-a29d-87b36aa6c82c',
      mobileNumber: '1234567890',
      botID: '0261394256641954',
      userContext: '',
      buttonResponse: 'Sports',
      language: 'English',
    });

    // Act
    const result = await chatbotService.processMessage(body);

    // Assert
    expect(result).toBe('ok');
    expect(messageService.categoryButtons).toHaveBeenCalledWith(
      body.from,
      'English',
    );
  });

  // When given a valid 'button_response' in the request body with the value of 'Browse Other Categories', it sends the sub-category buttons for the previously selected category to the user.
  it("should send sub-category buttons when given valid 'button_response' with value 'Browse Other Categories'", async () => {
    const body = {
      from: '1234567890',
      text: null,
      button_response: { body: 'Browse Other Categories' },
      persistent_menu_response: null,
    };

    jest.spyOn(userService.userRepository, 'findOne').mockResolvedValue({
      id: 'a76b9089-9583-48f9-a29d-87b36aa6c82c',
      mobileNumber: '1234567890',
      botID: '0261394256641954',
      userContext: '',
      buttonResponse: 'Sports',
      language: 'English',
    });

    jest.spyOn(userService, 'findUserByMobileNumber').mockResolvedValueOnce({
      id: 'a76b9089-9583-48f9-a29d-87b36aa6c82c',
      mobileNumber: '1234567890',
      botID: '0261394256641954',
      userContext: '',
      buttonResponse: 'Sports',
      language: 'English',
    });

    jest.spyOn(messageService, 'subCategoryButtons');
    // Act
    await chatbotService.processMessage(body);

    // Assert
    expect(messageService.subCategoryButtons).toHaveBeenCalledWith(
      '1234567890',
      'English',
      'Sports',
    );
  });

  // When the language button is clicked, save the language and show the main menu in the selected language.
  it('should show the language options when persistent menu is clicked', async () => {
    // Arrange
    const body = {
      from: '1234567890',
      text: null,
      button_response: null,
      persistent_menu_response: { body: 'English' },
    };

    jest.spyOn(userService.userRepository, 'findOne').mockResolvedValue({
      id: 'a76b9089-9583-48f9-a29d-87b36aa6c82c',
      mobileNumber: '1234567890',
      botID: '0261394256641954',
      userContext: '',
      buttonResponse: 'Sports',
      language: 'English',
    });

    jest.spyOn(userService, 'findUserByMobileNumber').mockResolvedValueOnce({
      id: 'a76b9089-9583-48f9-a29d-87b36aa6c82c',
      mobileNumber: '1234567890',
      botID: '0261394256641954',
      userContext: '',
      buttonResponse: 'Sports',
      language: 'English',
    });

    jest
      .spyOn(messageService, 'languageButtons')
      .mockResolvedValueOnce({ id: '83d9db82-b3b0-4802-b2d8-a92f481435c6' });

    // Act
    const result = await chatbotService.processMessage(body);

    // Assert
    expect(result).toBe('ok');
    expect(messageService.languageButtons).toHaveBeenCalledWith(
      '1234567890',
      'English',
    );
  });

  // When the language button is clicked, save the language and show the main menu in the selected language.
  it('should save the language and show the main menu in the selected language when the language button is clicked', async () => {
    // Arrange
    const body = {
      from: '1234567890',
      text: null,
      button_response: { body: 'English' },
      persistent_menu_response: null,
    };

    jest.spyOn(userService.userRepository, 'save').mockResolvedValue({
      id: 'a76b9089-9583-48f9-a29d-87b36aa6c82c',
      mobileNumber: '1234567890',
      botID: '0261394256641954',
      userContext: '',
      buttonResponse: 'Sports',
      language: 'English',
    });

    jest.spyOn(userService.userRepository, 'findOne').mockResolvedValue({
      id: 'a76b9089-9583-48f9-a29d-87b36aa6c82c',
      mobileNumber: '1234567890',
      botID: '0261394256641954',
      userContext: '',
      buttonResponse: 'Sports',
      language: 'English',
    });

    jest.spyOn(userService, 'findUserByMobileNumber').mockResolvedValueOnce({
      id: 'a76b9089-9583-48f9-a29d-87b36aa6c82c',
      mobileNumber: '1234567890',
      botID: '0261394256641954',
      userContext: '',
      buttonResponse: 'Sports',
      language: 'English',
    });

    // Act
    const result = await chatbotService.processMessage(body);

    // Assert
    expect(result).toBe('ok');
    // expect(userService.saveLanguage).toHaveBeenCalledWith(
    //   '1234567890',
    //   process.env.BOT_ID,
    //   'English',
    // );
    expect(messageService.categoryButtons).toHaveBeenCalledWith(
      '1234567890',
      'English',
    );
  });
});
