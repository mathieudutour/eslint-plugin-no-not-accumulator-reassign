const stopNodePattern = /(?:Statement|Declaration|Function(?:Expression)?|Program)$/

module.exports = {
  meta: {
    docs: {
      description: 'disallow reassigning `function` parameters',
      category: 'Best Practices',
      recommended: false
    },

    schema: [
      {
        type: 'array',
        items: {
          type: 'string'
        }
      },
      {
        type: 'object',
        properties: {
          props: {type: 'boolean'}
        },
        additionalProperties: false
      }
    ]
  },

  create (context) {
    const accumulators = context.options[0] || []
    const props = context.options[1] && Boolean(context.options[1].props)

    /**
     * Checks whether or not the reference modifies properties of its variable.
     * @param {Reference} reference - A reference to check.
     * @returns {boolean} Whether or not the reference modifies properties of its variable.
     */
    function isModifyingProp (reference) {
      var node = reference.identifier
      var parent = node.parent

      while (parent && !stopNodePattern.test(parent.type)) {
        switch (parent.type) {

          // e.g. foo.a = 0
          case 'AssignmentExpression':
            return parent.left === node

          // e.g. ++foo.a
          case 'UpdateExpression':
            return true

          // e.g. delete foo.a
          case 'UnaryExpression':
            if (parent.operator === 'delete') {
              return true
            }
            break

          // EXCLUDES: e.g. cache.get(foo.a).b = 0
          case 'CallExpression':
            if (parent.callee !== node) {
              return false
            }
            break

          // EXCLUDES: e.g. cache[foo.a] = 0
          case 'MemberExpression':
            if (parent.property === node) {
              return false
            }
            break

          default:
            break
        }

        node = parent
        parent = node.parent
      }

      return false
    }

    /**
     * Reports a reference if is non initializer and writable.
     * @param {Reference} reference - A reference to check.
     * @param {int} index - The index of the reference in the references.
     * @param {Reference[]} references - The array that the reference belongs to.
     * @returns {void}
     */
    function checkReference (reference, index, references) {
      var identifier = reference.identifier

      if (identifier &&
        !reference.init &&

        // Destructuring assignments can have multiple default value,
        // so possibly there are multiple writeable references for the same identifier.
        (index === 0 || references[index - 1].identifier !== identifier)
      ) {
        if (reference.isWrite()) {
          context.report(
            identifier,
            'Assignment to function parameter \'{{name}}\'.',
            {name: identifier.name})
        } else if (props && isModifyingProp(reference)) {
          context.report(
            identifier,
            'Assignment to property of function parameter \'{{name}}\'.',
            {name: identifier.name})
        }
      }
    }

    /**
     * Finds and reports references that are non initializer and writable.
     * @param {Variable} variable - A variable to check.
     * @returns {void}
     */
    function checkVariable (variable) {
      if (variable.defs[0].type === 'Parameter') {
        variable.references.forEach(checkReference)
      }
    }

    function isAccumulator (node) {
      if (!node) {
        return false
      }

      const parent = node.parent
      if (!parent || node.parent.type !== 'CallExpression') {
        return false
      }

      const callee = parent.callee
      if (!callee || callee.type !== 'MemberExpression') {
        return false
      }

      const property = parent.callee.property
      if (!property || property.type !== 'Identifier') {
        return false
      }

      return accumulators.indexOf(property.name) !== -1
    }

    /**
     * Checks parameters of a given function node.
     * @param {ASTNode} node - A function node to check.
     * @returns {void}
     */
    function checkForFunction (node) {
      let variables = context.getDeclaredVariables(node)
      if (isAccumulator(node)) {
        variables = variables.slice(1, variables.length)
      }
      variables.forEach(checkVariable)
    }

    return {

      // `:exit` is needed for the `node.parent` property of identifier nodes.
      'FunctionDeclaration:exit': checkForFunction,
      'FunctionExpression:exit': checkForFunction,
      'ArrowFunctionExpression:exit': checkForFunction
    }
  }
}
