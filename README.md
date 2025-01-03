# Keystroke Dynamics Authentication System

This project implements a user authentication system that leverages keystroke dynamics to enhance security. By analyzing the unique typing patterns of individuals, the system can verify user identities based on how they type, rather than solely relying on traditional methods like passwords.

### Features
- Biometric Authentication: Utilizes keystroke dynamics to analyze typing patterns for user verification.
- Data Collection: Captures keystroke data, including key press durations and intervals, to build user profiles.
- Pattern Analysis: Employs algorithms to compare current typing patterns against stored profiles for authentication.

### Usage
1. Data Collection: Use the provided interface to collect keystroke data from users during the registration phase.
2. Profile Creation: Generate unique typing profiles based on the collected data.
3. Authentication: During login attempts, compare the user's current typing pattern with the stored profile to verify identity.

### Project Structure
- ```db/```: Contains scripts and files related to data storage and management.
- ```ui/```: Includes the user interface components for data collection and authentication.
- ```Slide_045_052_226.pdf```: Presentation slides detailing the project's objectives, methodology, and results.

#### Contributing
Contributions are welcome! If you'd like to enhance the system or add new features, please fork the repository and submit a pull request.
