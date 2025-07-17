# Custom exception classes for the application

class ContractAnalysisError(Exception):
    """Custom exception for contract analysis errors"""
    def __init__(self, message, code=None, supplier=None):
        super().__init__(message)
        self.code = code
        self.supplier = supplier 