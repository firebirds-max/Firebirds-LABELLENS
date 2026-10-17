<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/2a848599-90f3-4f40-9c16-db1fbd68c9e2

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

   # LabelLens AI — Smart Food Label Analyzer

## About the Project

LabelLens AI is an AI-powered web application that helps people understand packaged food labels. Users upload images of ingredient lists and nutrition facts to receive simple explanations of ingredients, nutritional values, declared allergens, additives, and potential nutritional concerns.

**Tagline:** Scan it. Understand it. Choose smarter.

## Problem Statement

Food packaging contains technical terms, nutrition tables, and ingredient names that many consumers find difficult to understand. LabelLens aims to make this information more accessible so users can make informed food choices.

## Our Solution

LabelLens uses image understanding and AI-generated explanations to transform packaged food label information into an easy-to-read report.

## Key Features

- Food-label image upload and preview.
- AI-powered ingredient and nutrition analysis.
- Plain-language explanations.
- Nutrition summaries when values are available.
- Declared allergen awareness.
- Additive explanations and potential concerns.
- Missing or unreadable information warnings.

## Technology Stack

Document the actual technologies used in this repository, including:
- Frontend framework and styling.
- Backend and API framework, if applicable.
- Google Gemini API and model configuration.
- Image-processing libraries.
- Hosting and deployment platform.

## Architecture

1. The user uploads a food-label image.
2. The application validates the uploaded image.
3. The backend sends the image to the configured AI model.
4. The model returns extracted information and explanations.
5. The application validates the response and displays the report.

Update this description to match the actual request flow in the code.

## Installation and Setup

1. Install the required runtime and package manager for this project.
2. Clone the repository.
3. Install the dependencies listed in the project configuration.
4. Configure the required environment variables or platform secrets.
5. Start the application using the actual development command.
6. Open the local URL shown in the terminal.

Include the exact commands for this repository after verifying them.

## Configuration

Document the required environment variables, their purpose, and where to configure them. Use placeholders in examples and never include real credentials.

## Testing

Describe the test cases, test data, commands executed, and observed results. Clearly distinguish completed tests from planned tests.

## Deployment

Add the verified public application URL after deployment.

## AI Disclosure

LabelLens was developed with assistance from Google AI Studio and AI-powered coding tools. The application uses the Google Gemini API for image understanding and food-label explanations, subject to the actual implementation.

The team reviewed and tested the generated code and remains responsible for the final application. Document any additional AI tools or APIs actually used.

## Limitations

- Results depend on image clarity and label completeness.
- AI-generated explanations can contain errors.
- Incomplete images cannot establish the absence of allergens.
- Nutrition information should be checked against the original packaging.
- The application is informational and does not replace professional medical or dietary advice.

## Future Improvements

- Support additional Indian languages.
- Improve OCR and handling of blurry images.
- Add verified food-product databases.
- Expand automated testing.
- Improve accessibility and privacy controls.

## Team

Team Firebirds

Add each member's name and actual contribution before submission.
