import interpreter

interpreter.model = 'gpt-3.5-turbo'
interpreter.auto_run = True
# interpreter.chat('Use google maps to get all asian restaurants at Heilbronn')
interpreter.chat("Extract all emails from the website accenon.de") # Executes a single command
interpreter.chat()